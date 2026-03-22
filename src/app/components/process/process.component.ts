import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-process',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './process.component.html',
    styleUrls: ['./process.component.css']
})
export class ProcessComponent {
    steps = [
        {
            icon: 'fa-calendar-check',
            title: 'Book Appointment',
            desc: 'Select your desired service and book a convenient time slot online.'
        },
        {
            icon: 'fa-file-signature',
            title: 'Visit RTO',
            desc: 'Visit the RTO center with required documents at your scheduled time.'
        },
        {
            icon: 'fa-id-card',
            title: 'Get License',
            desc: 'Complete the test/process and get your driving license delivered.'
        }
    ];
}
