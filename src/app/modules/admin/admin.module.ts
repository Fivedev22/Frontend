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
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ForeignPipe } from './pages/pipes/foreign.pipe';
import { ProvincePipe } from './pages/pipes/province.pipe';
import { GenderTypePipe } from './pages/pipes/gender_type.pipe';
import { DocumentTypePipe } from './pages/pipes/document_type.pipe';
import { RouterModule } from '@angular/router';
import { PropertyFormComponent } from './pages/property-page/property-form/property-form.component';
import { AvailabilityStatusPipe } from './pages/pipes/availability_status.pipe';
import { ActivityStatusPipe } from './pages/pipes/activity_status.pipe';
import { PropertyTypePipe } from './pages/pipes/property_type.pipe';
import { PaymentFormComponent } from './pages/payment-page/payment-form/payment-form.component';
import { ReservationFormComponent } from './pages/reservation-page/reservation-form/reservation-form.component';
import { PaymentStatusPipe } from './pages/pipes/payment_status.pipe';
import { PaymentTypePipe } from './pages/pipes/payment_type.pipe';
import { ReservationOriginPipe } from './pages/pipes/reservation_origin.pipe';
import { ReservationTypePipe } from './pages/pipes/reservation_type.pipe';
import { ClientPipe } from './pages/pipes/client.pipe';
import { PropertyPipe } from './pages/pipes/property.pipe';
import { BookingPipe } from './pages/pipes/booking.pipe';

@NgModule({
  declarations: [
    AdminComponent,
    ClientPageComponent,
    ReservationPageComponent,
    DashboardPageComponent,
    PropertyPageComponent,
    PaymentPageComponent,
    ClientFormComponent,
    ForeignPipe,
    ProvincePipe,
    GenderTypePipe,
    DocumentTypePipe,
    PropertyFormComponent,
    AvailabilityStatusPipe,
    ActivityStatusPipe,
    PropertyTypePipe,
    PaymentFormComponent,
    ReservationFormComponent,
    PaymentStatusPipe,
    PaymentTypePipe,
    ReservationOriginPipe,
    ReservationTypePipe,
    ClientPipe,
    PropertyPipe,
    BookingPipe,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    RouterModule
  ],
})
export class AdminModule {}
