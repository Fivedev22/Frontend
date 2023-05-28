import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Calendar, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { Observable } from 'rxjs';
import { IReservation } from '../services/interfaces/reservation.interface';
import { ReservationService } from '../services/reservation.service';

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


  constructor(private reservationService: ReservationService) {}

  ngAfterViewInit() {
    this.initializeCalendar();
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
    const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow','mustard','gray','fuchsia','black']; // Lista de colores disponibles
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
          <h2>Detalles de la reserva</h2>
          <p>Booking Number: ${reservation.booking_number}</p>
          <p>Property Name: ${reservation.property.property_name}</p>
          <p>Client Name: ${reservation.client.name} ${reservation.client.last_name}</p>
          <p>Check-in Date: ${reservation.check_in_date}</p>
          <p>Check-out Date: ${reservation.check_out_date}</p>
          <!-- Agrega más detalles de la reserva según sea necesario -->
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
  
}
