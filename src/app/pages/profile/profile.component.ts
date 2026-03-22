import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: any = null;
    authService = inject(AuthService);
    router = inject(Router);
    toastService = inject(ToastService);

    currentTime: Date = new Date();
    isEditing = false;
    tempUser: any = {}; // For editing

    // Mock Stats for Premium UI
    profileStats = [
        { label: 'Applications', value: '3', icon: 'fa-file-invoice', color: '#6366f1' },
        { label: 'Appointments', value: '1', icon: 'fa-calendar-check', color: '#10b981' },
        { label: 'Documents', value: '4', icon: 'fa-folder-open', color: '#f59e0b' },
        { label: 'Total Tasks', value: '8', icon: 'fa-list-check', color: '#ec4899' }
    ];

    // OTP State
    isVerifyingOtp = false;
    otpSent = false;
    otp = '';
    newMobile = '';

    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        // If not logged in, redirect to login
        if (!this.user) {
            this.router.navigate(['/login']);
        }
    }

    toggleEdit() {
        this.isEditing = true;
        this.tempUser = { ...this.user }; // Clone
    }

    cancelEdit() {
        this.isEditing = false;
        this.tempUser = {};
    }

    saveProfile() {
        // Check if mobile changed
        if (this.tempUser.mobile !== this.user.mobile) {
            this.newMobile = this.tempUser.mobile;
            this.sendOtp();
            return;
        }

        // Normal update if mobile not changed
        this.updateUserAndRefresh(this.tempUser);
    }

    sendOtp() {
        this.isVerifyingOtp = true;
        this.authService.requestMobileUpdateOtp(this.newMobile, this.user._id).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.otpSent = true;
                    this.toastService.success('OTP sent to ' + this.newMobile);
                }
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Failed to send OTP');
                this.isVerifyingOtp = false;
            }
        });
    }

    verifyOtp() {
        this.authService.verifyMobileUpdateOtp(this.newMobile, this.otp, this.user._id).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.toastService.success('Mobile verified and updated!');
                    this.isVerifyingOtp = false;
                    this.otpSent = false;
                    this.otp = '';
                    this.updateUserAndRefresh(this.tempUser);
                }
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Invalid OTP');
            }
        });
    }

    cancelOtp() {
        this.isVerifyingOtp = false;
        this.otpSent = false;
        this.otp = '';
        this.tempUser.mobile = this.user.mobile; // Revert mobile
    }

    updateUserAndRefresh(data: any) {
        this.authService.updateUser(data).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.user = this.authService.getCurrentUser(); // Refresh
                    this.isEditing = false;
                    this.toastService.success('Profile Updated Successfully');
                }
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Update failed');
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                // Save base64 string
                const photoUrl = e.target.result;
                this.authService.updateUser({ photo: photoUrl }).subscribe({
                    next: (res: any) => {
                        if (res.success) {
                            this.user = this.authService.getCurrentUser(); // Refresh UI
                            this.toastService.success('Photo updated successfully');
                        }
                    },
                    error: (err: any) => {
                        this.toastService.error(err.error?.message || 'Photo upload failed');
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    }

    onLogout() {
        this.authService.logout();
    }

    // Security Features
    isChangingPassword = false;
    passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };

    openPasswordModal() {
        this.isChangingPassword = true;
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }

    closePasswordModal() {
        this.isChangingPassword = false;
    }

    submitPasswordChange() {
        if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
            this.toastService.error('Please fill all fields');
            return;
        }
        if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
            this.toastService.error('New passwords do not match');
            return;
        }

        const payload = {
            userId: this.user._id,
            currentPassword: this.passwordData.currentPassword,
            newPassword: this.passwordData.newPassword
        };

        this.authService.changePassword(payload).subscribe({
            next: (res) => {
                this.toastService.success('Password updated successfully');
                this.closePasswordModal();
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to update password');
            }
        });
    }
}
