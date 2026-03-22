import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    // ... (metadata)
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email = '';
    password = '';

    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    handleSubmit() {
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
                this.toastService.success('Login Successful!');
                this.router.navigate(['/services']);
            },
            error: (err) => {
                console.error('Login Error:', err);
                if (err.status === 403 && err.error?.message?.toLowerCase().includes('verify')) {
                    this.toastService.info(err.error.message || 'Please verify your email first.');
                    this.router.navigate(['/verify-otp'], { queryParams: { email: this.email } });
                } else {
                    this.toastService.error(err.error?.message || 'Login Failed');
                }
            }
        });
    }
}
