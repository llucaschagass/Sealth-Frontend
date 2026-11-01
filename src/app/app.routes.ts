import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { InfoComponent } from './pages/info/info.component';
import { ConfigComponent } from './pages/config/config.component';
import { HealthComponent } from './pages/health/health.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { MedicinesComponent } from './pages/medicines/medicines.component';
import { authGuard } from './core/auth.guard';
import { MainComponent } from './pages/main/main.component';

export const routes: Routes = [
    {
        path: "",
        component: MainComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "signup",
        component: SignupComponent
    },
    {
        path: "home",
        component: HomeComponent,
        canActivate: [authGuard]
    },
    {
        path: "info",
        component: InfoComponent,
        canActivate: [authGuard]
    },
    {
        path: "config",
        component: ConfigComponent,
        canActivate: [authGuard]
    },
    {
        path: "health",
        component: HealthComponent,
        canActivate: [authGuard]
    },
    {
        path: "appointment",
        component: AppointmentsComponent,
        canActivate: [authGuard]
    },
    {
        path: "medicines",
        component: MedicinesComponent,
        canActivate: [authGuard]
    }
];
