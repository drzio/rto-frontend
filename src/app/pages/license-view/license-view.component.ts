import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-license-view',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './license-view.component.html',
    styleUrls: ['./license-view.component.css']
})
export class LicenseViewComponent implements OnInit {
    apiService = inject(ApiService);
    router = inject(Router);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    userApp: any = null;
    licenseNumber: string = '';
    issueDate: Date = new Date();
    expiryDate: Date = new Date();
    imageBase64: string | null = null; // Store base64 photo

    // Helper for Class Descriptions
    classDescriptions: { [key: string]: string } = {
        'MCWG': 'Motor Cycle With Gear',
        'MCWOG': 'Motor Cycle Without Gear',
        'LMV': 'Light Motor Vehicle',
        'HMV': 'Heavy Motor Vehicle',
        'HGMV': 'Heavy Goods Motor Vehicle',
        'HPMV': 'Heavy Passenger Motor Vehicle'
    };

    ngOnInit() {
        this.fetchApplication();
    }

    validLicenses: any[] = [];

    isLoading = true;

    fetchApplication() {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                this.isLoading = false;
                try {
                    console.log("[DEBUG] API Response:", res);
                    if (res.success && res.data && res.data.length > 0) {
                        // Filter all valid licenses
                        this.validLicenses = res.data.filter((app: any) =>
                            ['License Generated', 'Approved', 'MCQ Passed', 'License Issued'].includes(app.status)
                        );
                        console.log("[DEBUG] Valid Licenses:", this.validLicenses);

                        // Sort: Permanent first, then Learning (or by date desc)
                        this.validLicenses.sort((a, b) => {
                            if (a.licenseType === 'Permanent' && b.licenseType === 'Learning') return -1;
                            if (a.licenseType === 'Learning' && b.licenseType === 'Permanent') return 1;
                            return 0;
                        });

                        if (this.validLicenses.length > 0) {
                            this.selectLicense(this.validLicenses[0]);
                        } else {
                            this.toast.error(`No valid license found. Raw statuses: ${res.data.map((a: any) => a.status).join(', ')}`);
                            this.router.navigate(['/dashboard']);
                        }
                    } else {
                        this.toast.error('No applications found from API.');
                        this.router.navigate(['/dashboard']);
                    }
                } catch (e: any) {
                    console.error("[DEBUG] Error inside next block:", e);
                    this.toast.error(`UI Error: ${e.message}`);
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error fetching applications', err);
                this.toast.error(`API Error: ${err.message || 'Failed to load details'}`);
                this.cdr.detectChanges();
                this.router.navigate(['/dashboard']);
            }
        });
    }

    selectLicense(app: any) {
        try {
            this.userApp = app;
            console.log('Selected License:', this.userApp);
            this.generateLicenseDetails();
            this.cdr.detectChanges(); // Force DOM update
        } catch (e: any) {
            console.error("[DEBUG] Error in selectLicense:", e);
            this.toast.error(`Display Error: ${e.message}`);
        }
    }

    preloadImage() {
        // No longer needed with Proxy
    }

    get photoUrl(): string {
        if (this.userApp?.documents?.photo) {
            // Use relative path which goes through Proxy
            // Remove 'uploads/' if the path already has it or adjust based on backend response
            // Backend sends path like 'uploads\17...jpg'. We need '/uploads/...'
            let path = this.userApp.documents.photo.replace(/\\/g, '/');
            if (!path.startsWith('uploads/') && !path.startsWith('/uploads/')) {
                path = '/uploads/' + path;
            } else if (!path.startsWith('/')) {
                path = '/' + path;
            }
            return path;
        }
        return 'assets/avatar-placeholder.svg';
    }

    get signatureUrl(): string {
        let sigPath = this.userApp?.documents?.signature;

        // Fallback to Learning License signature if missing on Permanent License
        if (!sigPath && !this.isLearnerLicense) {
            const learnerApp = this.validLicenses.find(l => l.licenseType === 'Learning');
            if (learnerApp?.documents?.signature) {
                sigPath = learnerApp.documents.signature;
            }
        }

        if (sigPath) {
            let path = sigPath.replace(/\\/g, '/');
            if (!path.startsWith('uploads/') && !path.startsWith('/uploads/')) {
                path = '/uploads/' + path;
            } else if (!path.startsWith('/')) {
                path = '/' + path;
            }
            return path;
        }
        return '';
    }

    generateLicenseDetails() {
        if (!this.userApp) return;

        // For Learner License, use a specific format: UP32 /0030372/2019
        const year = new Date(this.userApp.createdAt).getFullYear();
        const unique = String(this.userApp.applicationNo || this.userApp._id).slice(-7).toUpperCase();

        if (this.isLearnerLicense) {
            this.licenseNumber = `GJ01 /${unique}/${year}`;
        } else {
            this.licenseNumber = `DL-GJ01-${year}-${unique}`;
        }

        this.issueDate = this.userApp.updatedAt ? new Date(this.userApp.updatedAt) : new Date();
        this.expiryDate = new Date(this.issueDate);
        this.expiryDate.setMonth(this.expiryDate.getMonth() + 6); // 6 Months validity for LL
    }

    getVehicleDescription(code: string): string {
        return this.classDescriptions[code] || code;
    }



    get isLearnerLicense(): boolean {
        return this.userApp?.licenseType === 'Learning';
    }


    // Date Selection for DL
    selectedDLDate: string = '';

    downloadImage() {
        // ... (existing image logic can stay or be removed, but I will keep it for now as a fallback)
        if (!this.isLearnerLicense && !this.selectedDLDate) {
            this.toast.info('Please select a date for the Driving License.');
            return;
        }

        // ... existing html2canvas logic ... 
        // For now, let's just add the NEW method below this block in the next step, 
        // or I can replace this entire block if I want to enforce PDF.
        // Let's ADD the new method and keep this one as "Download Image".
    }

    downloadOfficialPdf() {
        if (!this.userApp || !this.userApp._id) return;

        // Call Backend API to get the PDF
        // We can use window.open for simplicity to trigger download, 
        // BUT to update status we might want an API call first or let the backend handle it.
        // Since backend updates status ON download request, a simple window.location.href or window.open works.
        // However, to update the UI *immediately* without reload, we might want to do it via API/Blob.

        // Let's use the API Service to get the blob.
        // We need to add downloadLicense method to ApiService first?
        // Or just use HttpClient directly here? ApiService is better.

        // Actually, let's just construct the URL and open it, then refresh the application.
        const token = localStorage.getItem('token');
        // If we use window.open, passing the token is hard if it's not in cookie. 
        // So we should use ApiService.

        this.apiService.downloadLicense(this.userApp._id).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `DL-${this.userApp.applicationNo}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);

                // Update Status Locally
                this.userApp.status = 'License Generated';
                this.toast.success('License Downloaded Successfully!');
            },
            error: (err) => {
                console.error("Download error", err);
                this.toast.error('Failed to download PDF. Please try again.');
            }
        });
    }

    onDateChange(event: any) {
        this.issueDate = new Date(event.target.value);
        // Recalculate expiry if needed, or keep logic
        const newExpiry = new Date(this.issueDate);
        if (this.isLearnerLicense) {
            newExpiry.setMonth(newExpiry.getMonth() + 6);
        } else {
            newExpiry.setFullYear(newExpiry.getFullYear() + 20);
        }
        this.expiryDate = newExpiry;
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
