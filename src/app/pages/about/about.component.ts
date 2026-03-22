import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
    private apiService = inject(ApiService);
    stats: any = {
        users: 0,
        services: '100+',
        support: '24/7',
        rating: '4.8'
    };

    ngOnInit() {
        window.scrollTo(0, 0);
        this.loadStats();
    }

    loadStats() {
        this.apiService.getPublicStats().subscribe({
            next: (res) => {
                if (res.success) {
                    this.stats.users = res.data.users;
                }
            },
            error: (err) => console.error('Error fetching stats:', err)
        });
    }
}
