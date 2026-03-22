import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
    selector: 'app-update-mobile',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './update-mobile.component.html',
    styleUrl: './update-mobile.component.css'
})
export class UpdateMobileComponent {
    private apiService = inject(ApiService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    step: 'details' | 'otp' = 'details';
    loading = false;

    formData = {
        licenseNo: '',
        oldMobile: '',
        newMobile: ''
    };

    otp = '';

    sendOtp() {
        if (!this.formData.licenseNo || !this.formData.oldMobile || !this.formData.newMobile) {
            this.toastService.error('All fields are required.');
            return;
        }

        if (this.formData.oldMobile === this.formData.newMobile) {
            this.toastService.error('New mobile number cannot be the same as old mobile number.');
            return;
        }

        if (this.formData.newMobile.length !== 10) {
            this.toastService.error('New mobile number must be 10 digits.');
            return;
        }

        this.loading = true;
        this.apiService.sendUpdateMobileOtp(this.formData).subscribe({
            next: (res: any) => {
                this.loading = false;
                if (res.success) {
                    this.toastService.success(res.message);
                    this.step = 'otp';
                }
            },
            error: (err: any) => {
                this.loading = false;
                console.error(err);
                this.toastService.error(err.error?.message || 'Failed to send OTP.');
            }
        });
    }

    verifyOtp() {
        if (!this.otp || this.otp.length < 4) {
            this.toastService.error('Please enter valid OTP.');
            return;
        }

        this.loading = true;
        const verifyData = {
            licenseNo: this.formData.licenseNo,
            newMobile: this.formData.newMobile,
            otp: this.otp
        };

        this.apiService.verifyUpdateMobileOtp(verifyData).subscribe({
            next: (res: any) => {
                this.loading = false;
                if (res.success) {
                    this.toastService.success(res.message);
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err: any) => {
                this.loading = false;
                console.error(err);
                this.toastService.error(err.error?.message || 'OTP Verification Failed.');
            }
        });
    }
}
