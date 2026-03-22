import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hero',
  imports: [RouterModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  private apiService = inject(ApiService);

  stats = {
    users: '0',
    licenses: '0',
    rtoOffices: '5',
    years: '0'
  };

  ngOnInit() {
    // Check for cached stats to display immediately
    const cachedStats = localStorage.getItem('heroStats');
    if (cachedStats) {
      this.stats = JSON.parse(cachedStats);
      this.stats.rtoOffices = '5'; // Force static 5 even from cache
    }

    this.apiService.getPublicStats().subscribe({
      next: (res: any) => {
        if (res.success) {
          const d = res.data;
          // Show exact numbers as requested
          this.stats = {
            users: d.users.toString(),
            licenses: d.licenses.toString(),
            rtoOffices: '5', // Force static 5 locally as well
            years: d.years.toString() + '+' // Years can keep + as it's time-based
          };
          // Save to local storage for next refresh
          localStorage.setItem('heroStats', JSON.stringify(this.stats));
        }
      },
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num + '+';
  }
}
