import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-features',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './features.component.html',
    styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
    features = [
        {
            icon: 'fa-laptop-code',
            title: 'Online Learner License Test',
            desc: 'Take the mock RTO exam from the comfort of your home. Practice with real question sets and get instant results.'
        },
        {
            icon: 'fa-calendar-check',
            title: 'Easy Slot Booking',
            desc: 'Book appointments for Driving License tests, vehicle registration, and fitness renewal seamlessly.'
        },
        {
            icon: 'fa-file-invoice',
            title: 'Digital Documentation',
            desc: 'Upload and manage your documents digitally. Eliminate the hassle of carrying physical papers.'
        },
        {
            icon: 'fa-credit-card',
            title: 'Secure Online Payments',
            desc: 'Pay vehicle taxes, license fees, and challans securely using our integrated payment gateway.'
        },
        {
            icon: 'fa-bell',
            title: 'Real-time Notifications',
            desc: 'Get SMS and email alerts for application status, upcoming appointments, and tax due dates.'
        },
        {
            icon: 'fa-globe',
            title: 'Multi-Language Support',
            desc: 'Access services in English and Gujarati for better understanding and ease of use.'
        }
    ];

    ngOnInit() {
        window.scrollTo(0, 0);
    }
}
