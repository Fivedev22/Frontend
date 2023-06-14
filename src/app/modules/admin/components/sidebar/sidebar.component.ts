import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() sideNavStatus: boolean = false;

  list = [
    {
      id: 1,
      url: 'dashboard',
      icon: 'explore',
      name: 'Principal',
    },
    {
      id: 2,
      url: 'reservations',
      icon: 'date_range',
      name: 'Reservas',
    },
    {
      id: 3,
      url: 'payments',
      icon: 'payment',
      name: 'Cobros',
    },
    {
      id: 4,
      url: 'clients',
      icon: 'perm_identity',
      name: 'Clientes',
    },
    {
      id: 5,
      url: 'properties',
      icon: 'home',
      name: 'Inmuebles',
    },
    {
      id: 6,
      url: 'statistics',
      icon: 'query_stats',
      name: 'Estadísticas',
    },
    {
      id: 7,
      url: 'reports',
      icon: 'description',
      name: 'Reporte Contable',
    },
  ];
}
