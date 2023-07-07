import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-chart-geo';
import { PaymentService } from '../../../../services/payment.service';
import { ReservationService } from '../../../../services/reservation.service';
import { ClientService } from '../../../../services/client-page.service';
import { PropertyService } from '../../../../services/property-page.service';

@Component({
  selector: 'app-statistic-page',
  templateUrl: './statistic-page.component.html',
  styleUrls: ['./statistic-page.component.css'],
})
export class StatisticPageComponent implements AfterViewInit {
  selectModule: number = 1;
  constructor(
    private paymentsService: PaymentService,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private propertyService: PropertyService
  ) {}

  ngAfterViewInit() {
    this.createPaymentChart();
    this.topPaymentTypesChart();
    this.createPendingPaymentsChart();
    this.createReservationChart();
    this.ClientsByProvinceChart();
    this.createGenderChart();
    this.topClientChart();
    this.reservationTypeChart();
    this.createOriginChart();
    this.createReservationsByMonthChart();
    this.createPropertyChart();
    this.PropertyByProvinceChart();
  }  

  createReservationChart() {
    const canvas = document.getElementById(
      'reservationChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.reservationService
        .findAllReservations()
        .subscribe((reservations) => {
          const propertyCounts = reservations.reduce((acc, reservation) => {
            const propertyName = reservation.property.property_name;
            acc[propertyName] = (acc[propertyName] || 0) + 1;
            return acc;
          }, {} as any);
          const propertyWithMostReservations = Object.keys(
            propertyCounts
          ).reduce((a, b) => (propertyCounts[a] > propertyCounts[b] ? a : b));
          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: Object.keys(propertyCounts),
              datasets: [
                {
                  label: 'Reservas por propiedad',
                  data: Object.values(propertyCounts),
                  backgroundColor: Object.keys(propertyCounts).map((property) =>
                    property === propertyWithMostReservations
                      ? 'rgba(75, 192, 192, 0.8)'
                      : 'rgba(75, 192, 192, 0.2)'
                  ),
                  borderColor: Object.keys(propertyCounts).map((property) =>
                    property === propertyWithMostReservations
                      ? 'rgba(75, 192, 192, 1)'
                      : 'rgba(75, 192, 192, 1)'
                  ),
                  borderWidth: 1,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Propiedad con más reservas',
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  grid: {
                    display: false,
                  },
                },
              },
            },
          });
        });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  createPaymentChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      this.paymentsService.findAllPaymentsPaid().subscribe((payments) => {
        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(i);
          return date.toLocaleString('default', { month: 'long' });
        });
        const dataByMonth = payments.reduce((acc, payment) => {
          const date = new Date(payment.createdAt);
          const month = date.toLocaleString('default', { month: 'long' });
          const startingPrice = parseFloat(payment.booking_starting_price);
          const discount = parseFloat(payment.booking_discount ?? "0");
          const totalPrice = startingPrice - discount;         
          
          acc[month] = (acc[month] || 0) + totalPrice;
          return acc;
        }, {} as any);        
        const datasetData = allMonths.map((month) => {
          const value = dataByMonth[month] || 0;
          return parseFloat(value.toFixed(2));
        });
        const totalIncome = datasetData.reduce((acc, income) => acc + income, 0);
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: allMonths,
            datasets: [
              {
                label: 'Monto ingresado por mes',
                data: datasetData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Ingresos por mes',
              },
              subtitle: {
                display: true,
                text: `Total: $${totalIncome}`,
              },
              tooltip: {
                callbacks: {
                  label: function (context: any) {
                    const labelIndex = context.dataIndex;
                    const labelValue = context.dataset.data[labelIndex];
                    const monthLabel = context.label;
                    return `${monthLabel}: $${labelValue.toFixed(2)}`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }
  
  createPendingPaymentsChart() {
    const canvas = document.getElementById('paymentPendingChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      this.paymentsService.findAllPayments().subscribe((payments) => {
        const pendingPayments = payments.filter(payment => payment.payment_status.id_payment_status === 1);
        const dataByMonth: Record<string, number> = {};
  
        pendingPayments.forEach(payment => {
          const date = new Date(payment.createdAt);
          const month = date.toLocaleString('default', { month: 'long' });
  
          const startingPrice = parseFloat(payment.booking_starting_price);
          const discount = parseFloat(payment.booking_discount ?? '0'); // Si discount es undefined, se asigna '0'
          const totalPrice = startingPrice - discount; // Resta el descuento al precio inicial
  
          if (!dataByMonth[month]) {
            dataByMonth[month] = totalPrice;
          } else {
            dataByMonth[month] += totalPrice;
          }
        });
  
        const months = Object.keys(dataByMonth);
        const datasetData = months.map(month => dataByMonth[month]);
  
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [{
              label: 'Monto de Pagos Pendientes',
              data: datasetData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Montos de Pagos Pendientes',
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }
  

  ClientsByProvinceChart() {
    const canvas = document.getElementById(
      'clientsByProvinceChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.clientService.findAllClients().subscribe((clients) => {
        const provinceCounts = clients.reduce((acc, client) => {
          const province = client.province?.province_name || 'Extranjero';
          acc[province] = (acc[province] || 0) + 1;
          return acc;
        }, {} as any);

        const labels = Object.keys(provinceCounts);
        const data = Object.values(provinceCounts);
        const backgroundColors = this.generateFixedColors(labels.length);

        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Clientes por provincia',
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  generateFixedColors(count: number) {
    const colors = [
      'rgba(255, 0, 0, 0.8)',
      'rgba(0, 255, 0, 0.8)',
      'rgba(0, 0, 255, 0.8)',
      'rgba(255, 255, 0, 0.8)',
      'rgba(255, 0, 255, 0.8)',
      'rgba(0, 255, 255, 0.8)',
      'rgba(128, 128, 128, 0.8)',
      'rgba(255, 165, 0, 0.8)',
      'rgba(0, 128, 0, 0.8)',
      'rgba(128, 0, 128, 0.8)',
      'rgba(0, 0, 128, 0.8)',
      'rgba(255, 192, 203, 0.8)',
      'rgba(128, 128, 0, 0.8)',
      'rgba(128, 0, 0, 0.8)',
      'rgba(0, 128, 128, 0.8)',
      'rgba(0, 0, 0, 0.8)',
      'rgba(255, 255, 255, 0.8)',
    ];

    const colorCount = Math.min(count, colors.length);
    return colors.slice(0, colorCount);
  }

  createGenderChart() {
    const canvas = document.getElementById('genderChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.clientService.findAllClients().subscribe((clients) => {
        const genderCounts = clients.reduce((acc, client) => {
          const gender =
            client.gender_type.gender_type_name;
          acc[gender] = (acc[gender] || 0) + 1;
          return acc;
        }, {} as any);

        const labels = Object.keys(genderCounts);
        const data = Object.values(genderCounts);
        const backgroundColors = this.generateFixedColors(labels.length);

        const chart = new Chart(ctx, {
          type: 'polarArea',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Distribución de género de los clientes',
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  topClientChart() {
    const canvas = document.getElementById(
      'topClientChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.reservationService
        .findAllReservations()
        .subscribe((reservations) => {
          const clientCounts = reservations.reduce((acc, reservation) => {
            const client = reservation.client;
            const clientId = `${client.name} ${client.last_name}`;
            acc[clientId] = (acc[clientId] || 0) + 1;
            return acc;
          }, {} as any);

          const topClients = Object.keys(clientCounts)
            .sort((a, b) => clientCounts[b] - clientCounts[a])
            .slice(0, 5);
          const labels = topClients;
          const data = topClients.map((client) => clientCounts[client]);
          const backgroundColors = this.generateFixedColors(labels.length);

          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Clientes con más reservas',
                  data: data,
                  backgroundColor: backgroundColors,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                  barPercentage: 0.5,
                  categoryPercentage: 0.6,
                },
                {
                  label: 'Línea de referencia',
                  data: data.map(
                    () => data.reduce((a, b) => a + b) / data.length
                  ),
                  type: 'line',
                  fill: false,
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 2,
                  pointRadius: 0,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Clientes con más reservas',
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  stacked: true,
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  stacked: true,
                  grid: {
                    display: true,
                  },
                },
              },
            },
          });
        });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  topPaymentTypesChart() {
    const canvas = document.getElementById(
      'topPaymentTypesChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.paymentsService.findAllPaymentsPaid().subscribe((payments) => {
        const paymentTypeCounts = payments.reduce((acc, payment) => {
          const paymentType = payment.payment_type.payment_type_name;
          acc[paymentType] = (acc[paymentType] || 0) + 1;
          return acc;
        }, {} as any);

        const topPaymentTypes = Object.keys(paymentTypeCounts)
          .sort((a, b) => paymentTypeCounts[b] - paymentTypeCounts[a])
          .slice(0, 5);
        const labels = topPaymentTypes;
        const data = topPaymentTypes.map(
          (paymentType) => paymentTypeCounts[paymentType]
        );
        const backgroundColors = this.generateFixedColors(labels.length);

        const chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Tipo de pagos más utilizados',
                data: data,
                backgroundColor: backgroundColors,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Tipos de pagos más utilizados por cobro',
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  reservationTypeChart() {
    const canvas = document.getElementById('polarChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.reservationService
        .findAllReservations()
        .subscribe((reservations) => {
          const reservationTypes = reservations.map(
            (reservation) => reservation.booking_type.booking_type_name
          );
          const typeCounts = reservationTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as any);

          const chart = new Chart(ctx, {
            type: 'polarArea',
            data: {
              labels: Object.keys(typeCounts),
              datasets: [
                {
                  label: 'Tipos de reserva',
                  data: Object.values(typeCounts),
                  backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                  borderColor: ['rgba(75, 192, 192, 1)'],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tipos de reserva más utilizados',
                },
              },
            },
          });
        });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  createOriginChart() {
    const canvas = document.getElementById('originChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.reservationService
        .findAllReservations()
        .subscribe((reservations) => {
          const originTypes = reservations.map(
            (reservation) => reservation.booking_origin.origin_name
          );
          const typeCounts = originTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as any);

          const bubbleData = Object.keys(typeCounts).map((type, index) => {
            return {
              x: index,
              y: typeCounts[type],
              r: 10,
            };
          });

          const labels = Object.keys(typeCounts);

          const chart = new Chart(ctx, {
            type: 'bubble',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Tipos de procedencia',
                  data: bubbleData,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tipos de procedencia de reserva más utilizados',
                },
              },
            },
          });
        });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  createReservationsByMonthChart() {
    const canvas = document.getElementById(
      'barByMonthChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.reservationService
        .findAllReservations()
        .subscribe((reservations) => {
          const allMonths = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(i);
            return date.toLocaleString('default', { month: 'long' });
          });

          const reservationsByMonth = allMonths.map((month) => {
            const reservationsInMonth = reservations.filter((reservation) => {
              const reservationDate = new Date(reservation.check_in_date);
              const reservationMonth = reservationDate.toLocaleString(
                'default',
                { month: 'long' }
              );
              return reservationMonth === month;
            });
            return reservationsInMonth.length;
          });

          const barColors = this.generateFixedColors(allMonths.length);

          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: allMonths,
              datasets: [
                {
                  label: 'Cantidad de reservas por mes',
                  data: reservationsByMonth,
                  backgroundColor: barColors,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Cantidad de reservas por mes',
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  createPropertyChart() {
    const canvas = document.getElementById(
      'propertyChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.propertyService.findAllProperties().subscribe((properties) => {
        const propertyTypes = properties.map(
          (property) => property.property_type.property_type_name
        );
        const typeCounts = propertyTypes.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as any);

        const labels = Object.keys(typeCounts);
        const backgroundColors = this.generateFixedColors(labels.length);

        const data = Object.values(typeCounts);

        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Cantidad de propiedades por tipo',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Cantidad de propiedades por tipo',
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  PropertyByProvinceChart() {
    const canvas = document.getElementById(
      'provinceChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.propertyService.findAllProperties().subscribe((properties) => {
        const provinces = properties.map(
          (property) => property.province.province_name
        );
        const provinceCounts = provinces.reduce((acc, province) => {
          acc[province] = (acc[province] || 0) + 1;
          return acc;
        }, {} as any);

        const labels = Object.keys(provinceCounts);
        const backgroundColors = this.generateFixedColors(labels.length);

        const data = Object.values(provinceCounts);

        const chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Cantidad de propiedades por provincia',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Cantidad de propiedades por provincia',
              },
            },
          },
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }

  showModule(modulo: number): void {
    this.selectModule = modulo;
    switch (modulo) {
      case 1:
        this.createPaymentChart();
        this.topPaymentTypesChart();
        break;
      case 2:
        this.ClientsByProvinceChart();
        this.createGenderChart();
        this.topClientChart();
        break;
      case 3:
        this.reservationTypeChart();
        this.createReservationChart();
        this.createReservationsByMonthChart();
        this.createOriginChart();
        break;
      case 4:
        this.createPropertyChart();
        this.PropertyByProvinceChart();
        break;
      default:
        break;
    }
  }
}
