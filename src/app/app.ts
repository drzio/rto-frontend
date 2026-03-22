import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { filter } from 'rxjs';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, NewsTickerComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  router = inject(Router);
  location = inject(Location);
  isPaymentPage = false;
  isAuthPage = false;

  ngOnInit() {
    // Initial check
    this.checkUrl(this.location.path());

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkUrl(event.urlAfterRedirects || event.url);
    });
  }

  checkUrl(url: string) {
    this.isPaymentPage = url.includes('/payment');
    this.isAuthPage = url.includes('/login') || url.includes('/register') || url.includes('/verify-otp') || url.includes('/forgot-password');
  }
}
