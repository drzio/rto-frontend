import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-testimonials',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './testimonials.component.html',
    styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
    reviews = [
        {
            name: 'Riya Patel',
            role: 'New Driver',
            img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            text: 'Applying for my learner license was so easy! The process is clearly explained and I got my slot immediately.'
        },
        {
            name: 'Amit Shah',
            role: 'Verified User',
            img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
            text: 'Renewing my vehicle registration was hassle-free. The online payment system is smooth and secure.'
        },
        {
            name: 'Sneha Gupta',
            role: 'Business Owner',
            img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
            text: 'Great initiative by the RTO. Saved me multiple visits to the office. Highly recommended!'
        }
    ];
}
