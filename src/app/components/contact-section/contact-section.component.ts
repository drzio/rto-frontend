import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { FormsModule } from '@angular/forms'; // For ngModel
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-contact-section', // Using contact-section selector
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-section.component.html',
    styleUrls: ['./contact-section.component.css']
})
export class ContactSectionComponent {
    formData = {
        name: '',
        email: '',
        message: ''
    };

    private toastService = inject(ToastService);

    onSubmit() {
        console.log('Form submitted:', this.formData);
        // Add logic to send data to backend or show alert
        this.toastService.success('Message sent! (Simulated)');
        this.formData = { name: '', email: '', message: '' };
    }
}
