import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.css']
})
export class StatsComponent {
    stats = [
        { label: 'Happy Users', value: '50K+', icon: 'fa-users', color: '#4facfe' },
        { label: 'Licenses Issued', value: '12K+', icon: 'fa-id-card', color: '#00f2fe' },
        { label: 'RTO Offices', value: '150+', icon: 'fa-building', color: '#43e97b' },
        { label: 'Years Served', value: '10+', icon: 'fa-award', color: '#fa709a' }
    ];
}
