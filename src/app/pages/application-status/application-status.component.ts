import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.css']
})
export class ApplicationStatusComponent implements OnInit {
  apiService = inject(ApiService);
  router = inject(Router);
  private toast = inject(ToastService);

  userApp: any = null;
  allApps: any[] = [];
  isLoading = true;

  timeline: any[] = [
    { status: 'Applied', label: 'Application Submitted', completed: false, active: false, icon: 'fa-file-text' },
    { status: 'Pending Verification', label: 'Document Verification', completed: false, active: false, icon: 'fa-search' },
    { status: 'Exam Scheduled', label: 'Slot Booking', completed: false, active: false, icon: 'fa-calendar-check' },
    { status: 'Approved', label: 'Driving Test / Exam', completed: false, active: false, icon: 'fa-car' },
    { status: 'License Issued', label: 'License Dispatch', completed: false, active: false, icon: 'fa-id-card' }
  ];

  ngOnInit() {
    this.fetchStatus();
  }

  fetchStatus() {
    this.apiService.getMyApplications().subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.allApps = res.data;
          this.userApp = res.data[0]; // Default to latest
          this.updateTimeline(this.userApp.status);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }



  get actionLabel(): string {
    if (!this.userApp) return '';
    const status = this.userApp.status;

    if (status === 'Documents Verified') return 'Pay Fees';
    if (status === 'Eligible for Slot Booking') return 'Book Slot';
    if (status === 'Eligible for Exam') return 'Take Online Exam';
    if (status === 'Exam Scheduled') return 'Take Exam';
    if (status === 'MCQ Passed') return 'Take Driving Test';
    if (status === 'License Generated') return 'Download License'; // New Action
    if (status === 'Approved') return 'License Dispatching...';
    // Removed 'Rejected' case to hide button

    return '';
  }

  resumeAction() {
    if (!this.userApp) return;
    const status = this.userApp.status;
    const type = this.userApp.licenseType;

    if (status === 'Documents Verified') {
      // Navigate to payment page (Placeholder)
      this.toast.info('Please contact RTO for payment or pay via counter.');
    } else if (status === 'Eligible for Slot Booking') {
      this.router.navigate(['/slot-booking']);
    } else if (status === 'Eligible for Exam' || status === 'Exam Scheduled') {
      // Logic: Learning -> MCQ, Permanent -> Driving Test
      if (type === 'Permanent') {
        this.router.navigate(['/driving-test']);
      } else {
        this.router.navigate(['/exam']);
      }
    } else if (status === 'MCQ Passed') {
      // Fallback if they have this status
      this.router.navigate(['/driving-test']);
    } else if (status === 'License Generated' || status === 'License Issued') {
      this.router.navigate(['/license-view']); // Navigate to preview and download
    }
  }

  retakeExam() {
    if (!this.userApp || !this.userApp._id) return;

    if (confirm('Are you sure you want to retake the exam? You will have to pay the application fee again.')) {
      this.apiService.retakeExam({ applicationId: this.userApp._id }).subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.fetchStatus(); // Refresh timeline and details
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to initiate retake process');
        }
      });
    }
  }

  updateTimeline(currentStatus: string) {
    // Map status to index (Simple logic)
    let activeIndex = -1;

    // Normalizing status to timeline steps
    // 0: Applied
    // 1: Document Verification
    // 2: Slot Booking
    // 3: Driving Test / Exam
    // 4: License Dispatch

    if (currentStatus === 'Pending Verification' || currentStatus === 'Verified' || currentStatus === 'Documents Verified') activeIndex = 1;
    else if (currentStatus === 'Eligible for Slot Booking') activeIndex = 2; // Can book slot now
    else if (currentStatus === 'Exam Scheduled') activeIndex = 3; // Exam is Next
    else if (currentStatus === 'Eligible for Exam') activeIndex = 3; // Exam is Active
    else if (currentStatus === 'MCQ Passed') activeIndex = 3; // Driving Test is Active (Step 3)
    else if (currentStatus === 'Pass') activeIndex = 4; // Exam Passed
    else if (currentStatus === 'Approved') activeIndex = 4; // Exam Done, Dispatch Next
    else if (currentStatus === 'Rejected') activeIndex = 3; // Stuck on Exam
    else if (currentStatus === 'License Issued' || currentStatus === 'License Generated') activeIndex = 4;
    else activeIndex = 0; // Default Applied

    this.timeline.forEach((step, index) => {
      if (index < activeIndex) {
        step.completed = true;
        step.active = false;
        step.error = false;
        if (step.status === 'Approved') step.label = 'Driving Test / Exam';
      } else if (index === activeIndex) {
        step.completed = false;
        step.active = true;

        // Final Step Completion (License Generated)
        if (index === 4 && (currentStatus === 'License Issued' || currentStatus === 'License Generated')) {
          step.completed = true;
          step.active = false;
        }

        // Rejected State
        if (currentStatus === 'Rejected') {
          step.label = 'Exam Failed';
          step.error = true;
        } else {
          step.error = false;
        }
      } else {
        step.completed = false;
        step.active = false;
        step.error = false;
      }
    });

    // Special: If Approved (Driving Test Passed) -> Mark Exam as Passed
    // But since we moved to index 4, index 3 is already marked completed by the loop loop (index < activeIndex)
  }

  get formattedAppId(): string {
    if (this.userApp && this.userApp._id) {
      return String(this.userApp._id).slice(18, 24).toUpperCase();
    }
    return 'N/A';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
