import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    email: string = '';
    otp: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    step: number = 1; // 1: Email, 2: OTP & Reset

    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    handleRequestOtp() {
        if (!this.email) {
            this.toastService.error('Please enter your email');
            return;
        }

        this.authService.forgotPassword(this.email).subscribe({
            next: (res) => {
                this.toastService.success('OTP sent to your email');
                this.step = 2;
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to send OTP');
            }
        });
    }

    handleResetPassword() {
        if (this.otp.length !== 6) {
            this.toastService.error('Please enter 6-digit OTP');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.toastService.error('Passwords do not match');
            return;
        }

        if (this.newPassword.length < 6) {
            this.toastService.error('Password must be at least 6 characters');
            return;
        }

        const data = {
            email: this.email,
            otp: this.otp,
            password: this.newPassword
        };

        this.authService.resetPassword(data).subscribe({
            next: (res) => {
                this.toastService.success('Password updated successfully! Please login.');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to reset password');
            }
        });
    }
}
