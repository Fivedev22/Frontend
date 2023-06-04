import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-chart-geo';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../services/client-page.service';
import { PropertyService } from '../services/property-page.service';


@Component({
  selector: 'app-statistic-page',
  templateUrl: './statistic-page.component.html',
  styleUrls: ['./statistic-page.component.css']
})
export class StatisticPageComponent implements AfterViewInit {

  constructor(
    private paymentsService: PaymentService, 
    private reservationService: ReservationService,
    private clientService: ClientService,
    private propertyService: PropertyService
    ) {}


  ngAfterViewInit() {
    this.createReservationChart();
    this.createPaymentChart();
    this.ClientsByProvinceChart();
    this.createGenderChart();
    this.topClientChart();
    this.topPaymentTypesChart();
    this.reservationTypeChart();
    this.createOriginChart();
    this.createReservationsByMonthChart();
    this.createPropertyChart();
    this.PropertyByProvinceChart();
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
            indexAxis: 'y', // Orientación del gráfico en el eje y
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
                beginAtZero: true
              },
              y: {
                grid: {
                  display: false
                }
              }
            }
          }
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
  
        // Sumar todos los ingresos por mes
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
                text: `Total: $${totalIncome.toFixed(2)}`,
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


  ClientsByProvinceChart() {
    const canvas = document.getElementById('clientsByProvinceChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      this.clientService.findAllClients().subscribe(clients => {
        // Obtener el número de clientes por provincia
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
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderColor: 'rgba(255, 255, 255, 1)',
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
                text: 'Clientes por provincia'
              }
            },
          }
        });
      });
    } else {
      console.error('No se pudo obtener el contexto del lienzo.');
    }
  }
  
  generateFixedColors(count: number) {
    const colors = [
      'rgba(255, 0, 0, 0.8)',   // Rojo
      'rgba(0, 255, 0, 0.8)',   // Verde
      'rgba(0, 0, 255, 0.8)',   // Azul
      'rgba(255, 255, 0, 0.8)', // Amarillo
      'rgba(255, 0, 255, 0.8)', // Magenta
      'rgba(0, 255, 255, 0.8)', // Cian
      'rgba(128, 128, 128, 0.8)', // Gris
      'rgba(255, 165, 0, 0.8)',  // Naranja
      'rgba(0, 128, 0, 0.8)',    // Verde oscuro
      'rgba(128, 0, 128, 0.8)',  // Púrpura
      'rgba(0, 0, 128, 0.8)',    // Azul oscuro
      'rgba(255, 192, 203, 0.8)',// Rosa
      'rgba(128, 128, 0, 0.8)',  // Oliva
      'rgba(128, 0, 0, 0.8)',    // Marrón
      'rgba(0, 128, 128, 0.8)',  // Verde azulado
      'rgba(0, 0, 0, 0.8)',      // Negro
      'rgba(255, 255, 255, 0.8)' // Blanco
    ];
  
    const colorCount = Math.min(count, colors.length);
    return colors.slice(0, colorCount);
  }
  


  createGenderChart() {
  const canvas = document.getElementById('genderChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.clientService.findAllClients().subscribe(clients => {
      // Obtener el número de clientes por género
      const genderCounts = clients.reduce((acc, client) => {
        const gender = client.gender_type.gender_type_name || 'No especificado';
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
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(255, 255, 255, 1)',
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
              text: 'Distribución de género de los clientes'
            }
          }
        }
      });
    });
  } else {
    console.error('No se pudo obtener el contexto del lienzo.');
  }
}

topClientChart() {
  const canvas = document.getElementById('topClientChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.reservationService.findAllReservations().subscribe(reservations => {
      // Obtener el número de reservas por cliente
      const clientCounts = reservations.reduce((acc, reservation) => {
        const client = reservation.client;
        const clientId = `${client.name} ${client.last_name}`;
        acc[clientId] = (acc[clientId] || 0) + 1;
        return acc;
      }, {} as any);

      // Obtener los clientes con más reservas
      const topClients = Object.keys(clientCounts).sort((a, b) => clientCounts[b] - clientCounts[a]).slice(0, 5);
      const labels = topClients;
      const data = topClients.map(client => clientCounts[client]);
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
              categoryPercentage: 0.6
            },
            {
              label: 'Línea de referencia',
              data: data.map(() => data.reduce((a, b) => a + b) / data.length), // Línea de referencia con el promedio de reservas
              type: 'line',
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: 'Clientes con más reservas'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              stacked: true,
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              stacked: true,
              grid: {
                display: true
              }
            }
          }
        }
      });
    });
  } else {
    console.error('No se pudo obtener el contexto del lienzo.');
  }
}

topPaymentTypesChart() {
  const canvas = document.getElementById('topPaymentTypesChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.paymentsService.findAllPayments().subscribe(payments => {
      // Obtener el número de pagos por tipo de pago
      const paymentTypeCounts = payments.reduce((acc, payment) => {
        const paymentType = payment.payment_type.payment_type_name;
        acc[paymentType] = (acc[paymentType] || 0) + 1;
        return acc;
      }, {} as any);

      // Obtener los tipos de pagos más utilizados
      const topPaymentTypes = Object.keys(paymentTypeCounts).sort((a, b) => paymentTypeCounts[b] - paymentTypeCounts[a]).slice(0, 5);
      const labels = topPaymentTypes;
      const data = topPaymentTypes.map(paymentType => paymentTypeCounts[paymentType]);
      const backgroundColors = this.generateFixedColors(labels.length);

      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Tipo de pagos más utilizados',
            data: data,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: 'Tipos de pagos más utilizados por cobro'
            }
          }
        }
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
    this.reservationService.findAllReservations().subscribe(reservations => {
      // Obtener los tipos de reserva y contar su frecuencia
      const reservationTypes = reservations.map(reservation => reservation.booking_type.booking_type_name);
      const typeCounts = reservationTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as any);

      // Crear el gráfico con los datos de los tipos de reserva
      const chart = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: Object.keys(typeCounts),
          datasets: [{
            label: 'Tipos de reserva',
            data: Object.values(typeCounts),
            backgroundColor: ['rgba(75, 192, 192, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)'],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Tipos de reserva más utilizados'
            }
          }
        }
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
    this.reservationService.findAllReservations().subscribe(reservations => {
      // Obtener los tipos de procedencia de reserva y contar su frecuencia
      const originTypes = reservations.map(reservation => reservation.booking_origin.origin_name);
      const typeCounts = originTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as any);

      // Convertir los datos en un formato compatible con el gráfico de burbujas
      const bubbleData = Object.keys(typeCounts).map((type, index) => {
        return {
          x: index, // Coordenada X basada en el índice
          y: typeCounts[type], // Coordenada Y basada en la frecuencia del tipo de procedencia
          r: 10 // Radio fijo para todas las burbujas
        };
      });

      // Obtener los nombres de los tipos de procedencia
      const labels = Object.keys(typeCounts);

      // Crear el gráfico de burbujas con los datos de los tipos de procedencia
      const chart = new Chart(ctx, {
        type: 'bubble',
        data: {
          labels: labels,
          datasets: [{
            label: 'Tipos de procedencia',
            data: bubbleData,
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
              text: 'Tipos de procedencia de reserva más utilizados'
            }
          }
        }
      });
    });
  } else {
    console.error('No se pudo obtener el contexto del lienzo.');
  }
}


createReservationsByMonthChart() {
  const canvas = document.getElementById('barByMonthChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.reservationService.findAllReservations().subscribe(reservations => {
      // Obtener todos los meses del año
      const allMonths = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(i);
        return date.toLocaleString('default', { month: 'long' });
      });

      // Contar la cantidad de reservas por mes
      const reservationsByMonth = allMonths.map(month => {
        const reservationsInMonth = reservations.filter(reservation => {
          const reservationDate = new Date(reservation.check_in_date);
          const reservationMonth = reservationDate.toLocaleString('default', { month: 'long' });
          return reservationMonth === month;
        });
        return reservationsInMonth.length;
      });

      // Generar colores aleatorios para las barras
      const barColors = this.generateFixedColors(allMonths.length);

      // Crear el gráfico de barras con los datos de cantidad de reservas por mes
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: allMonths,
          datasets: [{
            label: 'Cantidad de reservas por mes',
            data: reservationsByMonth,
            backgroundColor: barColors,
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
              text: 'Cantidad de reservas por mes'
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

createPropertyChart() {
  const canvas = document.getElementById('propertyChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.propertyService.findAllProperties().subscribe(properties => {
      // Obtener los tipos de propiedad y contar su cantidad
      const propertyTypes = properties.map(property => property.property_type.property_type_name);
      const typeCounts = propertyTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as any);

      // Obtener los nombres de los tipos de propiedad y los colores para las barras
      const labels = Object.keys(typeCounts);
      const backgroundColors = this.generateFixedColors(labels.length);

      // Obtener la cantidad de propiedades por tipo
      const data = Object.values(typeCounts);

      // Crear el gráfico de barras con los datos de cantidad por tipo de propiedad
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de propiedades por tipo',
            data: data,
            backgroundColor: backgroundColors,
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
              text: 'Cantidad de propiedades por tipo'
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


PropertyByProvinceChart() {
  const canvas = document.getElementById('provinceChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    this.propertyService.findAllProperties().subscribe(properties => {
      // Obtener las provincias de las propiedades y contar su cantidad
      const provinces = properties.map(property => property.province.province_name);
      const provinceCounts = provinces.reduce((acc, province) => {
        acc[province] = (acc[province] || 0) + 1;
        return acc;
      }, {} as any);

      // Obtener los nombres de las provincias y los colores para las secciones del gráfico de pastel
      const labels = Object.keys(provinceCounts);
      const backgroundColors = this.generateFixedColors(labels.length);

      // Obtener la cantidad de propiedades por provincia
      const data = Object.values(provinceCounts);

      // Crear el gráfico de pastel con los datos de cantidad por provincia
      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de propiedades por provincia',
            data: data,
            backgroundColor: backgroundColors,
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
              text: 'Cantidad de propiedades por provincia'
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