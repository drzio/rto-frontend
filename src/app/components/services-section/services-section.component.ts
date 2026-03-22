import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor
import { RouterLink, RouterModule } from '@angular/router';

@Component({
    selector: 'app-services-section',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './services-section.component.html',
    styleUrls: ['./services-section.component.css']
})
export class ServicesSectionComponent {
    services = [
        { id: 'learner-license', title: 'Learner License', icon: 'fa-book-open', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400' },
        { id: 'driving-license', title: 'Driving License', icon: 'fa-id-card', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=400' },
        { id: 'renew-license', title: 'Renew License', icon: 'fa-arrows-rotate', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400' },
        { id: 'pay-tax', title: 'Pay Tax', icon: 'fa-indian-rupee-sign', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400' },
    ];
}
