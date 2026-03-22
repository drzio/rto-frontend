import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  registerVerifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-verify-otp`, { email, otp }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          response.loginTime = new Date().toISOString();
          localStorage.setItem('user', JSON.stringify(response));
        }
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { email });
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          // Add Login Time
          response.loginTime = new Date().toISOString();
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Real Update for Profile Page
  updateUser(updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, updatedData).pipe(
      tap((res: any) => {
        if (res.success) {
          const currentUser = this.getCurrentUser();
          const newUser = { ...currentUser, ...res.data };
          localStorage.setItem('user', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
        }
      })
    );
  }

  // Mobile Update Mock
  requestMobileUpdateOtp(newMobile: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-mobile`, { action: 'send_otp', newMobile, userId });
  }

  verifyMobileUpdateOtp(newMobile: string, otp: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-mobile`, { action: 'verify_otp', newMobile, otp, userId }).pipe(
      tap((res: any) => {
        if (res.success) {
          // Update local user mobile
          this.updateUser({ mobile: newMobile });
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }
}
