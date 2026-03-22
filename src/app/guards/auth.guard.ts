import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Simple check for now, can be enhanced with AuthService method
    const token = localStorage.getItem('token');

    if (token) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};
