import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    formData = {
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    };

    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService); // Inject

    handleSubmit() {
        // --- Validation Rules ---

        // 1. Name: Required, Min 3 chars
        if (!this.formData.fullName || this.formData.fullName.length < 3) {
            this.toastService.error('Name must be at least 3 characters long');
            return;
        }

        // 2. Email: Valid Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email || !emailRegex.test(this.formData.email)) {
            this.toastService.error('Please enter a valid email address');
            return;
        }

        // 3. Mobile: Exactly 10 digits
        const mobileRegex = /^[0-9]{10}$/;
        if (!this.formData.mobile || !mobileRegex.test(this.formData.mobile)) {
            this.toastService.error('Mobile number must be exactly 10 digits');
            return;
        }

        // 4. Password: Min 6 chars
        if (!this.formData.password || this.formData.password.length < 6) {
            this.toastService.error('Password must be at least 6 characters long');
            return;
        }

        // 5. Confirm Password
        if (this.formData.password !== this.formData.confirmPassword) {
            this.toastService.error("Passwords do not match!");
            return;
        }

        const userData = {
            name: this.formData.fullName,
            email: this.formData.email,
            password: this.formData.password,
            mobile: this.formData.mobile
        };

        this.authService.register(userData).subscribe({
            next: (res: any) => {
                this.toastService.success(`OTP sent to ${this.formData.email}. Please verify.`);
                this.router.navigate(['/verify-otp'], { queryParams: { email: this.formData.email } });
            },
            error: (err) => {
                console.error('Registration Error:', err);
                const errorMessage = err.error?.message || err.message || 'Registration Failed';
                this.toastService.error(errorMessage);
            }
        });
    }
}
