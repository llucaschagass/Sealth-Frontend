import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Sealth | Sua saúde em boas mãos',
    loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'login',
    title: 'Entrar | Sealth',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    title: 'Criar conta | Sealth',
    loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    title: 'Esqueci minha senha | Sealth',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    title: 'Nova senha | Sealth',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'home',
    title: 'Início | Sealth',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'info',
    title: 'Informações importantes | Sealth',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/info/info.component').then((m) => m.InfoComponent),
  },
  {
    path: 'config',
    title: 'Configurações | Sealth',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/config/config.component').then((m) => m.ConfigComponent),
  },
  {
    path: 'health',
    title: 'Minha saúde | Sealth',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/health/health.component').then((m) => m.HealthComponent),
  },
  {
    path: 'appointment',
    title: 'Minhas consultas | Sealth',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/appointments/appointments.component').then((m) => m.AppointmentsComponent),
  },
  {
    path: 'medicines',
    title: 'Meus medicamentos | Sealth',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/medicines/medicines.component').then((m) => m.MedicinesComponent),
  },
  {
    path: 'vaccines',
    title: 'Minhas vacinas | Sealth',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/vaccines/vaccines.component').then((m) => m.VaccinesComponent),
  },
  { path: '**', redirectTo: '' },
];
