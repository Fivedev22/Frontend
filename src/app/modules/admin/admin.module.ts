import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientPageComponent } from './pages/client-page/client-page.component';
import { ReservationPageComponent } from './pages/reservation-page/reservation-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PropertyPageComponent } from './pages/property-page/property-page.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { ClientFormComponent } from './pages/client-page/components/client-form/client-form.component';

@NgModule({
  declarations: [
    AdminComponent,
    ClientPageComponent,
    ReservationPageComponent,
    DashboardPageComponent,
    PropertyPageComponent,
    PaymentPageComponent,
    ClientFormComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class AdminModule {}
