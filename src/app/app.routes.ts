import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { ServiceDetailsComponent } from './pages/service-details/service-details.component';
import { ExamRulesComponent } from './pages/exam/exam-rules/exam-rules.component';
import { StartExamComponent } from './pages/exam/start-exam/start-exam.component';
import { ResultComponent } from './pages/exam/result/result.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { FeaturesComponent } from './pages/features/features.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ApplyLicenseComponent } from './pages/apply-license/apply-license.component';
import { SlotBookingComponent } from './pages/slot-booking/slot-booking.component';
import { DrivingTestComponent } from './pages/driving-test/driving-test.component';
import { LicenseViewComponent } from './pages/license-view/license-view.component'; // Import
import { PaymentComponent } from './pages/payment/payment.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'verify-otp',
        loadComponent: () => import('./pages/register-verify/register-verify.component').then(m => m.RegisterVerifyComponent)
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'apply-license',
        component: ApplyLicenseComponent,
        canActivate: [authGuard]
    },
    {
        path: 'slot-booking',
        component: SlotBookingComponent,
        canActivate: [authGuard]
    },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactPageComponent },
    { path: 'features', component: FeaturesComponent },
    {
        path: 'update-mobile',
        loadComponent: () => import('./pages/update-mobile/update-mobile.component').then(m => m.UpdateMobileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'print-forms',
        loadComponent: () => import('./pages/print-forms/print-forms.component').then(m => m.PrintFormsComponent),
        canActivate: [authGuard]
    },

    // Protected Routes
    {
        path: 'services',
        component: ServicesPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'services/:serviceId',
        component: ServiceDetailsComponent,
        canActivate: [authGuard]
    },


    // Exam Module
    {
        path: 'exam',
        component: ExamRulesComponent,
        canActivate: [authGuard]
    },
    {
        path: 'exam/start',
        component: StartExamComponent,
        canActivate: [authGuard]
    },
    {
        path: 'exam/result',
        component: ResultComponent,
        canActivate: [authGuard]
    },
    {
        path: 'driving-test',
        component: DrivingTestComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: 'application-status',
        loadComponent: () => import('./pages/application-status/application-status.component').then(m => m.ApplicationStatusComponent),
        canActivate: [authGuard]
    },
    {
        path: 'support',
        loadComponent: () => import('./pages/support/support/support').then(m => m.Support),
        canActivate: [authGuard]
    },
    {
        path: 'license-view',
        component: LicenseViewComponent,
        canActivate: [authGuard]
    },
    {
        path: 'payment/:id',
        component: PaymentComponent,
        canActivate: [authGuard]
    },

    { path: '**', redirectTo: '' }
];
