import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { ClientPageComponent } from './pages/client-page/client-page.component';
import { ReservationPageComponent } from './pages/reservation-page/reservation-page.component';
import { PropertyPageComponent } from './pages/property-page/property-page.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { StatisticPageComponent } from './pages/statistic-page/statistic-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'clients', component: ClientPageComponent },
      { path: 'reservations', component: ReservationPageComponent },
      { path: 'properties', component: PropertyPageComponent },
      { path: 'payments', component: PaymentPageComponent },
      { path: 'statistics', component: StatisticPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
