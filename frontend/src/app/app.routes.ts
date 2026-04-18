import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { MainLayoutComponent } from './components/main-layout/main-layout';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'amenities',
        loadChildren: () => import('./amenities/amenities-module').then(m => m.AmenitiesModule)
      },
      { path: '', redirectTo: 'amenities', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];