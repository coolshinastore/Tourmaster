import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/manager.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'tours',
    loadComponent: () => import('./features/tours/catalog/tour-catalog.component').then(m => m.TourCatalogComponent),
  },
  {
    path: 'tours/:id',
    loadComponent: () => import('./features/tours/detail/tour-detail.component').then(m => m.TourDetailComponent),
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/wizard/booking-wizard.component').then(m => m.BookingWizardComponent),
  },
  {
    path: 'booking/success',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/success/booking-success.component').then(m => m.BookingSuccessComponent),
  },
  {
    path: 'cabinet',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabinet/bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  },
  {
    path: 'cabinet/bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabinet/bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  },
  {
    path: 'cabinet/wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabinet/wishlist/wishlist.component').then(m => m.WishlistComponent),
  },
  {
    path: 'cabinet/profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabinet/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'admin',
    canActivate: [managerGuard],
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'admin/tours',
    canActivate: [managerGuard],
    loadComponent: () => import('./features/admin/tours/admin-tours.component').then(m => m.AdminToursComponent),
  },
  {
    path: 'admin/bookings',
    canActivate: [managerGuard],
    loadComponent: () => import('./features/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent),
  },
  {
    path: 'admin/clients',
    canActivate: [managerGuard],
    loadComponent: () => import('./features/admin/clients/admin-clients.component').then(m => m.AdminClientsComponent),
  },
  { path: '**', redirectTo: '' },
];
