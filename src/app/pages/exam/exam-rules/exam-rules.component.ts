import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-exam-rules',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './exam-rules.component.html',
    styleUrls: ['./exam-rules.component.css']
})
export class ExamRulesComponent implements OnInit {
    private router = inject(Router);
    private apiService = inject(ApiService);
    private toastService = inject(ToastService);

    canStart = false;
    message = 'Please wait...';
    testDate: string = '';

    ngOnInit() {
        window.scrollTo(0, 0);
        this.checkEligibility();
    }

    checkEligibility() {
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                if (res.success && res.data.length > 0) {
                    const app = res.data[0];

                    // Allow if status is 'Eligible for Slot Booking' (Admin Verified) OR 'Exam Scheduled' OR 'Approved' (Driving Test Passed)
                    const validStatuses = ['Eligible for Slot Booking', 'Exam Scheduled', 'Documents Verified', 'Pending Verification', 'Approved', 'Rejected', 'Eligible for Exam'];

                    if (!validStatuses.includes(app.status)) {
                        this.message = 'Your application is not approved for the exam yet. Please wait for Admin Verification.';
                        this.canStart = false; // Ensure button is disabled
                        return;
                    }

                    // If 'Exam Scheduled', check date (optional, kept for backward compat)
                    if (app.status === 'Exam Scheduled' && app.testDate) {
                        const today = new Date();
                        const examDate = new Date(app.testDate);
                        today.setHours(0, 0, 0, 0);
                        examDate.setHours(0, 0, 0, 0);

                        if (today.getTime() >= examDate.getTime()) {
                            this.canStart = true;
                            this.message = 'You can now start the exam.';
                        } else {
                            this.canStart = false;
                            this.message = `Your exam is scheduled for ${new Date(app.testDate).toLocaleDateString()}. Please come back then.`;
                        }
                    } else {
                        // For 'Eligible for Slot Booking', allow immediately
                        this.canStart = true;
                        this.message = 'Application Approved. You can start the exam now.';
                    }
                } else {
                    this.message = 'No application found.';
                    this.canStart = false;
                }
            },
            error: () => {
                this.message = 'Error checking eligibility.';
                this.canStart = false;
            }
        });
    }

    startTest() {
        if (this.canStart) {
            this.router.navigate(['/exam/start']);
        } else {
            this.toastService.info(this.message); // Show reason via Toast
        }
    }
}
