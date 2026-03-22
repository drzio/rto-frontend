import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticker-wrap" *ngIf="news">
      <div class="ticker">
        <div class="ticker__item">{{ news }}</div>
        <!-- Duplicate for seamless loop if needed, but CSS animation handles it -->
      </div>
    </div>
  `,
  styleUrls: ['./news-ticker.component.css']
})
export class NewsTickerComponent implements OnInit {
  news = '';
  private api = inject(ApiService);

  ngOnInit() {
    this.api.getPublicContent('newsTicker').subscribe({

      next: (res: any) => {
        if (res.success && res.value) {
          this.news = res.value;
        }
      }
    });
  }
}
