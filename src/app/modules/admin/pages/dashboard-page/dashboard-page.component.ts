import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  Calendar,
  CalendarOptions,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { Observable } from 'rxjs';
import { IReservation } from '../../../../interfaces/reservation.interface';
import { ReservationService } from '../../../../services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotePageComponent } from './components/note-page/note-page.component';

// bootstrap
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { PropertyService } from 'src/app/services/property-page.service';
import { IProperty } from 'src/app/interfaces/property.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements AfterViewInit {
  @ViewChild('calendarEl') calendarEl!: ElementRef;
  @ViewChild('notesContainer') notesContainer!: ElementRef;

  private calendar!: Calendar;
  private dialogRef: MatDialogRef<NotePageComponent> | undefined;
  private reservations!: IReservation[];
  private selectedReservation: IReservation | undefined;
  notes: string[] = [];
  showNotes = false;
  notificationShown: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('notificationShown');
    });
    this.initializeCalendar();
    this.checkCurrentDateReservations();
  }

  initializeCalendar() {
    const options: CalendarOptions = {
      plugins: [dayGridPlugin, bootstrap5Plugin],
      themeSystem: 'bootstrap5',
      locale: esLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay',
      },
      customButtons: {
        dateTime: {
          text: this.getCurrentDateTime(),
          click: () => {
            this.calendar.today();
            this.renderCalendar();
          },
        },
      },
      events: (fetchInfo, successCallback, failureCallback) => {
        this.fetchReservations().subscribe(
          (reservations: IReservation[]) => {
            const events: EventInput[] =
              this.transformReservationsToEvents(reservations);
            successCallback(events);
          },
          (error) => {
            failureCallback(error);
          }
        );
      },
      eventColor: 'red',
      eventClick: this.handleEventClick.bind(this),
    };

    this.calendar = new Calendar(this.calendarEl.nativeElement, options);
    this.renderCalendar();
  }

  renderCalendar() {
    if (this.calendar) {
      this.calendar.destroy();
    }

    this.calendar.render();
  }

  fetchReservations(): Observable<IReservation[]> {
    return this.reservationService.findAllReservations();
  }


  transformReservationsToEvents(reservations: IReservation[]): EventInput[] {
    const currentDate = new Date();
    const events: EventInput[] = [];
  
    reservations.forEach((reservation, index) => {
      const checkOutDate = new Date(reservation.check_out_date);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
  
      if (checkOutDate >= currentDate) {
        events.push({
          title: ` N° Rva: ${reservation.booking_number} - Propiedad: ${reservation.property.property_name} - Cliente: ${reservation.client.name} ${reservation.client.last_name}`,
          start: reservation.check_in_date,
          end: checkOutDate.toISOString().split('T')[0],
          color: this.getColorByIndex(index),
          id: reservation.id_booking?.toString(),
        });
      }
    });
  
    return events;
  }
  

  getColorByIndex(index: number): string {
    const colors = [
      '#e81e4a',
      '#663333',
      '#f85741',
      '#243a69',
      '#2790b0',
      '#94ba65',
      '#353432',
      '#4e4d4a',
      '#2b4e72',
    ];
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  }

  getCurrentDateTime(): string {
    const currentDateTime = new Date();
    return currentDateTime.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }

  handleEventClick(eventClickArg: EventClickArg) {
    const eventId = +eventClickArg.event.id;
    this.reservationService
      .findOneReservation(eventId)
      .subscribe((reservation: IReservation) => {
        const popupWindow = window.open('', '_blank', 'width=600,height=400');
        popupWindow?.document.write(`
        <html>
        <head>
        <style>
        body {
          font-family: helvetica;
          background-color: #e8f5e9; /* Agregado: Color verde claro al fondo */
        }
        h2 {
          font-size: 16px;
          font-style: normal;
        }
        p {
          font-size: 14px;
          font-style: normal;
        }
      </style>
        </head>
        <body>
          <h2>Detalles de la reserva</h2>
          <p>- Número de reserva: <b>${reservation.booking_number}</b></p>
          <p>- Propiedad: <b>${reservation.property.property_name}</b></p>
          <p>- Cliente: <b>${reservation.client.name} ${
          reservation.client.last_name
        }</b></p>
          <p>- Fecha check-in: <b>${reservation.check_in_date}</b></p>
          <p>- Fecha check-out: <b>${reservation.check_out_date}</b></p>
          <p>- Cantidad adultos: <b>${reservation.adults_number}</b></p>
          <p>- Cantidad niños: <b>${reservation.kids_number}</b></p>
          <p>- Mascotas: <b>${reservation.pets_number}</b></p>
          <p>- Marca: <b>${reservation.brand}</b></p>
          <p>- Modelo: <b>${reservation.model}</b></p>
          <p>- Patente: <b>${reservation.licensePlate}</b></p>
          <p>- Monto de reserva: <b>$ ${parseFloat(reservation.starting_price).toLocaleString()}</b></p>
          <p>- Descuento: <b>% ${reservation.discount}</b></p>
          <p>- Monto con descuento: <b>$ ${calculateDiscountedAmount(reservation.starting_price,reservation.discount)}</b></p>
          <p>- Monto depósito: <b>${parseFloat(reservation.deposit_amount).toLocaleString()}</b>$ </p>
          <p>- Forma de Pago (depósito): <b>${reservation.payment_type.payment_type_name}</b> </p>
          <p>- Monto a cobrar: <b>$ ${parseFloat(reservation.booking_amount).toLocaleString()}</b></p>
        </body>
      </html>
        `);
      });
      function calculateDiscountedAmount(startingPrice: string, discount: string | undefined): string {
        const startingPriceNum = parseFloat(startingPrice);
        const discountNum = discount ? parseFloat(discount) : 0;
        const discountedAmount = startingPriceNum - (startingPriceNum * discountNum / 100);
        return discountedAmount.toLocaleString();
      }
  }

  viewPropertyStatus() {
    this.propertyService.updateActivityStatus().subscribe(
      () => {
        this.propertyService.findAllProperties().subscribe(
          (properties: IProperty[]) => {
            if (properties.length === 0) {
              Swal.fire('No se encontraron inmuebles', 'No hay propiedades disponibles', 'info');
              return;
            }
            const tableRows = properties.map(property => {
              return `
                <tr>
                  <td>${property.property_name}</td>
                  <td>${property.availability_status.availability_status_name}</td>
                  <td>${property.activity_status.activity_status_name}</td>
                </tr>
              `;
            }).join('');
  
            const popupWindow = window.open('', '_blank', 'width=800,height=600');
            popupWindow?.document.write(`
              <html>
                <head>
                  <title>Inmuebles</title>
                  <style>
                    body {
                      background-color: #e8f5e9; /* Fondo verde claro */
                      font-family: Arial, sans-serif; /* Fuente */
                      font-size: 20px; /* Tamaño de fuente */
                      line-height: 1.5; /* Espaciado entre líneas */
                      margin: 20px; /* Márgenes */
                    }
                  
                    h2 {
                      font-weight: normal; /* Titulos sin negrita */
                    }
                  
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                  
                    th, td {
                      padding: 8px;
                      text-align: left;
                      border-bottom: 1px solid #ddd;
                    }
                  
                    th {
                      background-color: #4CAF50; /* Color de fondo del encabezado */
                      color: white; /* Color de texto del encabezado */
                    }
                  
                    tr:nth-child(even) {
                      background-color: #f2f2f2; /* Color de fondo de las filas pares */
                    }
                  </style>
                </head>
                <body>
                  <h2>Estado de inmuebles</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre Inmueble</th>
                        <th>Estado Disponibilidad</th>
                        <th>Estado Actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRows}
                    </tbody>
                  </table>
                </body>
              </html>
            `);
          },
          (error) => {
            console.error(error);
          }
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }
  

  showReservationDetails() {
    const reservationDetailsElement =
      document.getElementById('reservationDetails');
    if (reservationDetailsElement) {
      const reservationDetailsHtml = `
        <p><strong>Número de reserva:</strong> ${this.selectedReservation?.booking_number}</p>
        <p><strong>Propiedad:</strong> ${this.selectedReservation?.property.property_name}</p>
        <p><strong>Cliente:</strong> ${this.selectedReservation?.client.name} ${this.selectedReservation?.client.last_name}</p>
      `;
      reservationDetailsElement.innerHTML = reservationDetailsHtml;
    }
  }

  checkCurrentDateReservations() {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    this.reservationService.findAllReservations().subscribe(
      (reservations: IReservation[]) => {
        const hasReservations = reservations.some((reservation) => {
          const eventStartDate = new Date(reservation.check_in_date)
            .toISOString()
            .split('T')[0];
          return eventStartDate === currentDateString;
        });

        if (hasReservations) {
          this.showNotification('¡Hay reservas para hoy!');
        } else {
          this.showNotification('No hay reservas para hoy');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  showNotification(message: string) {
    const notificationShown = localStorage.getItem('notificationShown');
    if (!notificationShown) {
      this.snackBar.open(message, 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      localStorage.setItem('notificationShown', 'true');
    }
  }

  openNotePage() {
    this.dialogRef = this.dialog.open(NotePageComponent, {
      width: '800px',
      height: '600px',
    });
  }
}
