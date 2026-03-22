import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css', // Updated filename
})
export class DashboardComponent implements OnInit { // Renamed Class in case it was just Dashboard
  user: any;
  userApp: any = null;
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  constructor() {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.fetchMyApplication();
  }

  fetchMyApplication() {
    this.apiService.getMyApplications().subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.userApp = res.data[0]; // Assume latest app
        }
      }
    });
  }

  navigateToApply() {
    this.router.navigate(['/apply-license']);
  }

  navigateToSlotBooking() {
    this.router.navigate(['/slot-booking']);
  }

  navigateToExam() {
    // Navigate to Online MCQ Exam
    this.router.navigate(['/exam']);
  }

  navigateToDrivingTest() {
    // Navigate to Driving Test (Game/Simulation)
    this.router.navigate(['/driving-test']);
  }

  downloadLicense() {
    this.router.navigate(['/license-view']);
  }

  navigateToStatus() {
    this.router.navigate(['/application-status']);
  }

  makePayment() {
    if (!this.userApp || !this.userApp._id) return;

    if (confirm('Proceed to pay application fee?')) {
      this.apiService.payApplicationFee(this.userApp._id).subscribe({
        next: (res) => {
          this.toast.success('Payment Successful!');
          this.fetchMyApplication(); // Refresh status
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Payment Failed');
        }
      });
    }
  }

  retakeExam() {
    if (!this.userApp || !this.userApp._id) return;

    if (confirm('Are you sure you want to retake the exam? You will have to pay the application fee again.')) {
      this.apiService.retakeExam({ applicationId: this.userApp._id }).subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.fetchMyApplication();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to initiate retake process');
        }
      });
    }
  }
}

