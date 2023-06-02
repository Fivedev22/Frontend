import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Calendar, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { Observable } from 'rxjs';
import { IReservation } from '../services/interfaces/reservation.interface';
import { ReservationService } from '../services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements AfterViewInit {
  @ViewChild('calendarEl') calendarEl!: ElementRef;

  private calendar!: Calendar;
  private reservations!: IReservation[];
  private selectedReservation: IReservation | undefined;


  constructor(private reservationService: ReservationService, private snackBar: MatSnackBar) {}

  ngAfterViewInit() {
    this.initializeCalendar();
    this.checkCurrentDateReservations(); // Agregar llamada al método para verificar las reservas en la fecha actual

  }

  initializeCalendar() {
    const options: CalendarOptions = {
      plugins: [dayGridPlugin],
      locale: esLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay,dateTime'
      },
      customButtons: {
        dateTime: {
          text: this.getCurrentDateTime(),
          click: () => {
            this.calendar.today();
            this.renderCalendar();
          }
        }
      },
      
      events: (fetchInfo, successCallback, failureCallback) => {
        this.fetchReservations().subscribe(
          (reservations: IReservation[]) => {
            const events: EventInput[] = this.transformReservationsToEvents(reservations);
            successCallback(events);
          },
          (error) => {
            failureCallback(error);
          }
        );
      },
      eventColor: 'red', // Color predeterminado para los eventos
      eventClick: this.handleEventClick.bind(this)
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
    // Transformar los datos de las reservas en eventos para el calendario
    const events: EventInput[] = reservations.map((reservation, index) => {
      return {
        title: ` N° Rva: ${reservation.booking_number} - Propiedad: ${reservation.property.property_name} - Cliente: ${reservation.client.name} ${reservation.client.last_name}`,
        start: reservation.check_in_date,
        end: reservation.check_out_date,
        color: this.getColorByIndex(index), // Obtener el color en función del índice
        id: reservation.id_booking?.toString() // Convierte a string el ID de la reserva
      };
    });

    return events;
  }

  getColorByIndex(index: number): string {
    // Obtener el color en función del índice de la reserva
    const colors = ['red', 'blue', 'green', 'orange', 'purple','mustard','gray','fuchsia','black']; // Lista de colores disponibles
    const colorIndex = index % colors.length; // Obtener el índice del color en función del módulo
    return colors[colorIndex]; // Devolver el color correspondiente
  }

  getCurrentDateTime(): string {
    const currentDateTime = new Date();
    return currentDateTime.toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  }

  handleEventClick(eventClickArg: EventClickArg) {
    const eventId = +eventClickArg.event.id; // Conversión a número utilizando el operador '+'
    this.reservationService.findOneReservation(eventId).subscribe(
      (reservation: IReservation) => {
        // Abrir ventana emergente con los detalles de la reserva
        const popupWindow = window.open('', '_blank', 'width=600,height=400');
        popupWindow?.document.write(`
        <html>
        <head>
          <style>
            body {
              background-color: #c8e6c9; /* Color de fondo verde manzana claro */
              font-family: Georgia, 'Times New Roman', Times, serif; /* Fuente predeterminada */
            }
            h2, p {
              font-style: italic; /* Fuente en cursiva */
            }
          </style>
        </head>
        <body>
          <h2>Detalles de la reserva</h2>
          <p>- Número de reserva: <b>${reservation.booking_number}</b></p>
          <p>- Propiedad: <b>${reservation.property.property_name}</b></p>
          <p>- Cliente: <b>${reservation.client.name} ${reservation.client.last_name}</b></p>
          <p>- Fecha check-in: <b>${reservation.check_in_date}</b></p>
          <p>- Fecha check-out: <b>${reservation.check_out_date}</b></p>
          <p>- Cantidad adultos: <b>${reservation.adults_number}</b></p>
          <p>- Cantidad niños: <b>${reservation.kids_number}</b></p>
          <p>- Mascotas: <b>${reservation.pets_number}</b></p>
          <p>- Precio inicial: <b>$ ${reservation.starting_price.toLocaleString()}</b></p>
          <p>- Descuento: <b>% ${reservation.discount}</b></p>
          <p>- Monto depósito: <b>${reservation.deposit_amount.toLocaleString()}</b>$ </p>
          <p>- Monto reserva: <b>$ ${reservation.booking_amount.toLocaleString()}</b></p>
        </body>
      </html>
        `);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  showReservationDetails() {
    // Obtén el elemento HTML donde se mostrarán los detalles de la reserva
    const reservationDetailsElement = document.getElementById('reservationDetails');
    if (reservationDetailsElement) {
      // Construye el HTML con los detalles de la reserva
      const reservationDetailsHtml = `
        <p><strong>Número de reserva:</strong> ${this.selectedReservation?.booking_number}</p>
        <p><strong>Propiedad:</strong> ${this.selectedReservation?.property.property_name}</p>
        <p><strong>Cliente:</strong> ${this.selectedReservation?.client.name} ${this.selectedReservation?.client.last_name}</p>
        <!-- Agrega más detalles según tus necesidades -->
      `;
      // Asigna el HTML al elemento
      reservationDetailsElement.innerHTML = reservationDetailsHtml;
    }
  }

  checkCurrentDateReservations() {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Obtener la fecha actual en formato 'YYYY-MM-DD'
    
    this.reservationService.findAllReservations().subscribe(
      (reservations: IReservation[]) => {
        const hasReservations = reservations.some((reservation) => {
          const eventStartDate = new Date(reservation.check_in_date).toISOString().split('T')[0]; // Obtener la fecha de check-in de la reserva en formato 'YYYY-MM-DD'
          return eventStartDate === currentDateString;
        });
  
        if (hasReservations) {
          this.showNotification('¡Hay reservas para hoy!');
        }  else {
          this.showNotification('No hay reservas para hoy');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  

  showNotification(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 86400000, // Duración de la notificación en milisegundos (24 horas)
      horizontalPosition: 'center',
      verticalPosition: 'top' // Cambia 'bottom' a 'top'
    });
  }
  
  
}
