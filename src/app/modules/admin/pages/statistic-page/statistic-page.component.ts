import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';


@Component({
  selector: 'app-statistic-page',
  templateUrl: './statistic-page.component.html',
  styleUrls: ['./statistic-page.component.css']
})
export class StatisticPageComponent implements AfterViewInit {

  constructor(private paymentsService: PaymentService, private reservationService: ReservationService) {}


  ngAfterViewInit() {
    this.createReservationChart();
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      this.paymentsService.findAllPayments().subscribe(payments => {
        // Obtener todos los meses del año
        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(i);
          return date.toLocaleString('default', { month: 'long' });
        });
  
        // Obtener los cobros por mes
        const dataByMonth = payments.reduce((acc, payment) => {
          const date = new Date(payment.createdAt);
          const month = date.toLocaleString('default', { month: 'long' });
          acc[month] = (acc[month] || 0) + payment.payment_amount_total;
          return acc;
        }, {} as any);
  
        // Completar los datos para todos los meses
        const datasetData = allMonths.map(month => dataByMonth[month] || 0);
  
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: allMonths,
            datasets: [{
              label: 'Monto ingresado por mes',
              data: datasetData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Ingresos por mes'
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  createReservationChart() {
    const canvas = document.getElementById('reservationChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      this.reservationService.findAllReservations().subscribe(reservations => {
        // Obtener el número de reservas por propiedad
        const propertyCounts = reservations.reduce((acc, reservation) => {
          const propertyName = reservation.property.property_name;
          acc[propertyName] = (acc[propertyName] || 0) + 1;
          return acc;
        }, {} as any);
  
        // Obtener la propiedad con más reservas
        const propertyWithMostReservations = Object.keys(propertyCounts).reduce((a, b) => propertyCounts[a] > propertyCounts[b] ? a : b);
  
        // Crear el gráfico con la propiedad con más reservas destacada
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(propertyCounts),
            datasets: [{
              label: 'Reservas por propiedad',
              data: Object.values(propertyCounts),
              backgroundColor: Object.keys(propertyCounts).map(property => property === propertyWithMostReservations ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.2)'),
              borderColor: Object.keys(propertyCounts).map(property => property === propertyWithMostReservations ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Propiedad con más reservas'
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }


  
}
  
  
  
  
  
