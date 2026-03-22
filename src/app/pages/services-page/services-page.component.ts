import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-services-page',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './services-page.component.html',
    styleUrls: ['./services-page.component.css']
})
export class ServicesPageComponent implements OnInit {
    allServices = [
        {
            id: 'learner-license',
            title: 'Learner License',
            description: 'Apply for a new Learner License. Take the online test and get your LL instantly.',
            img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
        },
        {
            id: 'driving-license',
            title: 'Driving License',
            description: 'Apply for a Permanent Driving License after completing your LL period.',
            img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600'
        },
        {
            id: 'renew-license',
            title: 'Renew License',
            description: 'Renew your expired Driving License with minimal documentation.',
            img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'
        },
        {
            id: 'pay-tax',
            title: 'Pay Vehicle Tax',
            description: 'Calculate and pay your vehicle road tax online.',
            img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600'
        },

    ];

    ngOnInit() {
        window.scrollTo(0, 0);
    }
}
