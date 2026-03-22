import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngClass
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common'; // To consume state
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-result',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
    score = 0;
    total = 10;
    percentage = 0;
    isPassed = false;
    userName = 'Applicant Name';

    private location = inject(Location);
    private router = inject(Router);
    private authService = inject(AuthService);
    private apiService = inject(ApiService); // Inject ApiService

    ngOnInit() {
        const state = this.location.getState() as any;
        if (state && state.score !== undefined) {
            this.score = state.score;
            this.total = state.total || 10;
            this.percentage = (this.score / this.total) * 100;
            this.isPassed = this.percentage >= 60;

            // Submit Result to Backend
            this.submitResult();
        } else {
            // Redirect if no state (direct access)
            this.router.navigate(['/exam']);
        }

        const user = this.authService.getCurrentUser();
        if (user && user.name) {
            this.userName = user.name;
        }
    }

    submitResult() {
        // Fetch latest application to get ID
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                if (res.success && res.data.length > 0) {
                    const appId = res.data[0]._id;
                    const resultStatus = this.isPassed ? 'Pass' : 'Fail';

                    this.apiService.submitExamResult({
                        applicationId: appId,
                        score: this.score,
                        result: resultStatus
                    }).subscribe({
                        next: (res) => console.log('Result Submitted:', res),
                        error: (err) => console.error('Error submitting result:', err)
                    });
                }
            }
        });
    }

    downloadLicense() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Smart Card Dimensions (Standard ID-1 is ~85.6mm x 54mm) -> Scaling to px
        canvas.width = 856;
        canvas.height = 540;

        // --- 1. Background ---
        // Light gradient background
        const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, '#eef2f3');
        grd.addColorStop(1, '#8e9eab'); // Metallic/Plastic feel
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Watermark / Pattern (Optional lines)
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i - 200, canvas.height);
            ctx.stroke();
        }

        // --- 2. Header Band ---
        ctx.fillStyle = '#003366'; // Dark Blue Header
        ctx.fillRect(0, 0, canvas.width, 80);

        // Header Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('UNION OF INDIA', canvas.width / 2, 35);
        ctx.font = '18px Arial';
        ctx.fillText('DRIVING LICENCE', canvas.width / 2, 60);

        // --- 3. Chip Icon (Gold) ---
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(50, 100, 60, 50);
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 100, 60, 50);
        // Chip lines
        ctx.beginPath();
        ctx.moveTo(80, 100); ctx.lineTo(80, 150);
        ctx.moveTo(50, 125); ctx.lineTo(110, 125);
        ctx.stroke();

        // --- 4. Photo Placeholder ---
        ctx.fillStyle = '#ddd';
        ctx.fillRect(50, 180, 150, 180);
        ctx.strokeStyle = '#999';
        ctx.strokeRect(50, 180, 150, 180);
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('PHOTO', 125, 275);

        // --- 5. User Details ---
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000';

        const startX = 250;
        let currentY = 130;
        const lineHeight = 35;

        // Label Styles
        const drawField = (label: string, value: string) => {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#555';
            ctx.fillText(label, startX, currentY);

            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(value, startX + 150, currentY);
            currentY += lineHeight;
        };

        const licenseNo = `GJ-01-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

        drawField('Licence No:', licenseNo);
        drawField('Name:', this.userName.toUpperCase());
        drawField('Date of Issue:', new Date().toLocaleDateString());

        // Validity (6 months for LL)
        const validityDate = new Date();
        validityDate.setMonth(validityDate.getMonth() + 6);
        drawField('Valid Till:', validityDate.toLocaleDateString());

        drawField('Blood Group:', 'B+ (Imaginary)'); // Placeholder
        drawField('Address:', 'Gujarat, India');

        // --- 6. Footer / Signature ---
        ctx.textAlign = 'center';
        ctx.font = 'italic 16px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('Authorized Signatory', 650, 480);

        // Stamp / Seal (Circle)
        ctx.beginPath();
        ctx.arc(650, 420, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = '#003366';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '10px Arial';
        ctx.fillText('RTO AUTHORITY', 650, 425);

        // --- 7. Download ---
        const link = document.createElement('a');
        link.download = `License_${this.userName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}
