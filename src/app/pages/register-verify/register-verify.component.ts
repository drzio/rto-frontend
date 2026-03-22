import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-register-verify',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register-verify.component.html',
    styleUrls: ['./register-verify.component.css']
})
export class RegisterVerifyComponent implements OnInit {
    otp: string = '';
    email: string = '';

    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toastService = inject(ToastService);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'];
            if (!this.email) {
                this.toastService.error('Email missing. Redirecting to register.');
                this.router.navigate(['/register']);
            }
        });
    }

    verifyOtp() {
        if (this.otp.length !== 6) {
            this.toastService.error('Please enter 6-digit OTP');
            return;
        }

        this.authService.registerVerifyOtp(this.email, this.otp).subscribe({
            next: (res) => {
                this.toastService.success('Email Verified Successfully! Please Login.');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Verification Failed');
            }
        });
    }

    resendOtp() {
        this.authService.resendOtp(this.email).subscribe({
            next: (res: any) => {
                this.toastService.success(res.message || 'OTP resent successfully!');
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to resend OTP');
            }
        });
    }
}
