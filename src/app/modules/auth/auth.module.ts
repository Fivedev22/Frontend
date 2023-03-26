import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginPageComponent,
    ResetPasswordPageComponent,
    ForgotPasswordPageComponent,
  ],
  imports: [CommonModule, AuthRoutingModule, SharedModule, ReactiveFormsModule],
})
export class AuthModule {}
