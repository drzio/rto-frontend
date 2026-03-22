import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
    selector: 'app-print-forms',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './print-forms.component.html',
    styleUrl: './print-forms.component.css'
})
export class PrintFormsComponent {
    private apiService = inject(ApiService);
    private toastService = inject(ToastService);

    formData = {
        applicationNo: '',
        dob: ''
    };

    loading = false;

    downloadForm() {
        if (!this.formData.applicationNo || !this.formData.dob) {
            this.toastService.error('Please enter Application Number and Date of Birth.');
            return;
        }

        this.loading = true;
        this.apiService.downloadApplicationForm(this.formData).subscribe({
            next: (blob: Blob) => {
                this.loading = false;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Application-Form-${this.formData.applicationNo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.toastService.success('Form downloaded successfully!');
            },
            error: (err: any) => {
                this.loading = false;
                console.error(err);
                // Try to read the blob error message
                if (err.error instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        try {
                            const errorObj = JSON.parse(e.target.result);
                            this.toastService.error(errorObj.message || 'Download Failed');
                        } catch {
                            this.toastService.error('Download Failed');
                        }
                    };
                    reader.readAsText(err.error);
                } else {
                    this.toastService.error('Failed to download form. Please check details.');
                }
            }
        });
    }
}
