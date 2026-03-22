import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
    paymentMethod: 'card' | 'qr' | 'cash' = 'card';
    applicationId: string = '';
    amount: number = 0;
    isSubmitting = false;
    paymentDone = false;

    cardDetails = {
        number: '',
        holder: '',
        expiry: '',
        cvv: ''
    };

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private apiService = inject(ApiService);
    private toastService = inject(ToastService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.applicationId = params['id'];
        });

        // Get amount from router state or query params if needed, 
        // but for security it's better to fetch application details. 
        // For now, I'll rely on state passed during navigation or default.
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.amount = navigation.extras.state['amount'];
        } else {
            // Fallback: This might be issue if user refreshes. 
            // In real app we should fetch application details to get amount.
            // I will add a fetch here to be safe if amount is missing.
            this.fetchApplicationDetails();
        }
    }

    fetchApplicationDetails() {
        // We don't have a direct 'getOneApplication' public endpoint easily accessible 
        // without modifying backend much or digging into 'my-applications'.
        // For this refactor, I will trust the user won't refresh essentially or 
        // I'll set a default just so it doesn't break, or re-fetch 'my-applications' list.
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                const app = res.data.find((a: any) => a._id === this.applicationId);
                if (app) {
                    // Determine fee based on type logic (mirrored from frontend config)
                    // Or use what backend has (paymentAmount might be 0 initially).
                    // I will use the logic from apply-license briefly here or default to 500.
                    if (app.licenseType === 'Learning') this.amount = 750;
                    else if (app.licenseType === 'Permanent') this.amount = 1000;
                    else if (app.licenseType === 'Renewal') this.amount = 650;
                    else if (app.licenseType === 'Duplicate License' || app.licenseType === 'Vehicle Tax') this.amount = 200;
                    else this.amount = 500;
                }
            },
            error: () => {
                this.toastService.error("Failed to load application details.");
            }
        });
    }

    processPayment() {
        this.isSubmitting = true;

        const finalizePayment = () => {
            this.apiService.payApplicationFee(this.applicationId).subscribe({
                next: (res) => {
                    this.paymentDone = true;
                    this.isSubmitting = false;
                    this.toastService.success('Payment Successful!');
                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 1500);
                },
                error: (err) => {
                    this.isSubmitting = false;
                    this.toastService.error(err.error?.message || 'Payment processing failed.');
                }
            });
        };

        if (this.paymentMethod === 'cash') {
            setTimeout(finalizePayment, 1000);
        } else if (this.paymentMethod === 'qr') {
            setTimeout(finalizePayment, 2000);
        } else {
            if (!this.cardDetails.number || this.cardDetails.number.length < 16 ||
                !this.cardDetails.cvv || this.cardDetails.cvv.length < 3 ||
                !this.cardDetails.expiry || !this.cardDetails.holder) {
                this.toastService.error('Please enter valid card details.');
                this.isSubmitting = false;
                return;
            }

            // --- Expiry Date Validation ---
            const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
            if (!expiryRegex.test(this.cardDetails.expiry)) {
                this.toastService.error('Please enter a valid expiry date (MM/YY).');
                this.isSubmitting = false;
                return;
            }

            const [expMonthStr, expYearStr] = this.cardDetails.expiry.split('/');
            const expMonth = parseInt(expMonthStr, 10);
            const expYear = parseInt('20' + expYearStr, 10);
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            // Check if year is in the past, or if it's the current year but past month
            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                this.toastService.error('Expiry date cannot be in the past. Please enter a valid future date.');
                this.isSubmitting = false;
                return;
            }
            setTimeout(finalizePayment, 2000);
        }
    }
}
