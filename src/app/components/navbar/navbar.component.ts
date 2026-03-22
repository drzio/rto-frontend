import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass, ngIf
import { Router, RouterLink, RouterLinkActive, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule], // Add RouterModule for RouterLink
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    isScrolled = false;
    user: any = null;
    isHomePage = true;
    isAuthPage = false;

    private authService = inject(AuthService);
    private router = inject(Router);

    ngOnInit() {
        this.authService.currentUser$.subscribe(u => {
            this.user = u;
        });
        this.checkCurrentUrl(); // Initial check

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.checkCurrentUrl(); // Update on navigation
        });
    }

    checkCurrentUrl() {
        this.isHomePage = this.router.url === '/';
        const url = this.router.url;
        this.isAuthPage = url.includes('/login') || url.includes('/register');
    }

    checkUser() {
        this.user = this.authService.getCurrentUser();
    }

    handleLogout() {
        this.authService.logout();
        this.user = null;
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }
}
