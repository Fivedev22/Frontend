import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientPageComponent } from './pages/client-page/client-page.component';
import { ReservationPageComponent } from './pages/reservation-page/reservation-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PropertyPageComponent } from './pages/property-page/property-page.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { ClientFormComponent } from './pages/client-page/components/client-form/client-form.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ForeignPipe } from '../../pipes/foreign.pipe';
import { ProvincePipe } from '../../pipes/province.pipe';
import { GenderTypePipe } from '../../pipes/gender_type.pipe';
import { DocumentTypePipe } from '../../pipes/document_type.pipe';
import { RouterModule } from '@angular/router';
import { PropertyFormComponent } from './pages/property-page/components/property-form/property-form.component';
import { AvailabilityStatusPipe } from '../../pipes/availability_status.pipe';
import { ActivityStatusPipe } from '../../pipes/activity_status.pipe';
import { PropertyTypePipe } from '../../pipes/property_type.pipe';
import { PaymentFormComponent } from './pages/payment-page/components/payment-form/payment-form.component';
import { ReservationFormComponent } from './pages/reservation-page/components/reservation-form/reservation-form.component';
import { PaymentStatusPipe } from '../../pipes/payment_status.pipe';
import { PaymentTypePipe } from '../../pipes/payment_type.pipe';
import { ReservationOriginPipe } from '../../pipes/reservation_origin.pipe';
import { ReservationTypePipe } from '../../pipes/reservation_type.pipe';
import { ClientPipe } from '../../pipes/client.pipe';
import { PropertyPipe } from '../../pipes/property.pipe';
import { BookingPipe } from '../../pipes/booking.pipe';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ComponentsModule } from 'src/app/global/components/components.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ImageUploadDialogComponent } from './pages/property-page/components/image-upload-dialog/image-upload-dialog.component';
import { ContractUploadComponent } from './pages/reservation-page/components/contract-upload/contract-upload.component';
import { UploadInventoryComponent } from './pages/property-page/components/upload-inventory/upload-inventory.component';
import { StatisticPageComponent } from './pages/statistic-page/statistic-page.component';
import { UnarchiveClientComponent } from './pages/client-page/components/unarchive-client/unarchive-client.component';
import { UnarchivePropertyComponent } from './pages/property-page/components/unarchive-property/unarchive-property.component';
import { UnarchivePaymentComponent } from './pages/payment-page/components/unarchive-payment/unarchive-payment.component';
import { UnarchiveReservationComponent } from './pages/reservation-page/components/unarchive-reservation/unarchive-reservation.component';
import { ReportPageComponent } from './pages/report-page/report-page.component';
import { PhoneMaskDirective } from './pages/client-page/components/client-form/phone-mask-directive';

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
    HeaderComponent,
    SidebarComponent,
    ImageUploadDialogComponent,
    ContractUploadComponent,
    UploadInventoryComponent,
    StatisticPageComponent,
    ReportPageComponent,
    UnarchiveClientComponent,
    UnarchivePropertyComponent,
    UnarchivePaymentComponent,
    UnarchiveReservationComponent,
    PhoneMaskDirective,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    RouterModule,
    ComponentsModule,
    FormsModule,
    CurrencyMaskModule,
    SlickCarouselModule,
  ],
})
export class AdminModule {}
