import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReservationService } from '../services/reservation.service';
import { IReservation } from '../services/interfaces/reservation.interface';
import Swal from 'sweetalert2';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';
import jsPDF from 'jspdf';
import { ClientService } from '../services/client-page.service';
import { IClient } from '../services/interfaces/client.interface';


@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.css']
})
export class ReservationPageComponent implements OnInit {
  title = 'reservation';

  displayedColumns: string[] = ['booking_number', 'booking_type', 'client', 'property','check_in_date','check_out_date', 'actions'];

  dataSource!: MatTableDataSource<IReservation>;

  clientName!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly reservationService: ReservationService,
    private readonly clientService: ClientService
  ) { }

  ngOnInit(): void {
    this.findAllReservations();
  }

  findAllReservations() {
    this.reservationService.findAllReservations().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  findAllArchived() {
    this.reservationService.findAllReservationsArchived().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  deleteReservation(id: number, booking_number: number, check_in_date: Date) {
    Swal.fire({
      title: '¿Desea eliminar la reserva?',
      text: `Reserva Nro: ${booking_number} - Check-in: ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.removeReservation(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Reserva eliminada correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllReservations();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }

  archiveReservation(id: number, booking_number: number, check_in_date: Date) {
    Swal.fire({
      title: '¿Desea archivar la reserva?',
      text: `Reserva Nro: ${booking_number} - Fecha Check-in: ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Archivar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.archiveReservation(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Reserva archivada correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllReservations();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }

  unarchiveReservation(id: number, booking_number: number, check_in_date: Date) {
    Swal.fire({
      title: '¿Desea desarchivar la reserva?',
      text: `Reserva Nro: ${booking_number} - Check-in: ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.unarchiveReservation(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Reserva desarchivada correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllArchived();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }
 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  openFormCreateReservation() {
    this.dialog.open(ReservationFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.findAllReservations();
        }
      });
  }

  openFormEditReservation(row: IReservation) {
    this.dialog.open(ReservationFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllReservations();
        }
      });
  }

  generatePdf(id: number) {
    this.reservationService.findOneReservation(id).subscribe(data => {

      const doc = new jsPDF();

    // Agrega el logo
    const logo = new Image();
    logo.src = 'https://dummyimage.com/100x100/000/fff&text=Logo';
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);

    // Establece la fuente y el tamaño del título de la empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Apartamentos Anahi', 50, 20);
    doc.setFontSize(12);
    doc.text('El Benteveo 990', 50, 30);
    doc.text('Villa Parque Siquiman, Provincia de Cordoba, Argentina', 50, 40);
    doc.text('Telefono: 0 (3541) 64-8016', 50, 50);
    doc.text('Email: anahiapartamentos@gmail.com', 50, 60);

    // Dibuja una línea horizontal debajo de la información de la empresa
    doc.setLineWidth(0.5);
    doc.line(10, 70, 200, 70);

    // Establece la fuente y el tamaño del título de la factura
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Comprobante de Reserva', 10, 80);

    // Establece la fuente y el tamaño del texto de detalles
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Agrega los detalles de la reserva
    doc.text(`Reserva Nro: ${data.booking_number}`, 10, 90);
    doc.text(`Fecha de emision: ${data.createdAt}`, 10, 100);
    doc.text(`Fecha de check-in: ${data.check_in_date}`, 10, 110);
    doc.text(`Fecha de check-out: ${data.check_out_date}`, 10, 120);
    //doc.text(`Tipo de reserva: ${data.booking_type}`, 10, 130);
    doc.text(`Cliente: ${data.client}`, 10, 130);



    // Dibuja una línea horizontal debajo de los detalles
    doc.setLineWidth(0.5);
    doc.line(10, 140, 200, 140);

    // Establece la fuente y el tamaño del texto de agradecimiento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`¡Gracias por reservar!`, 10, 150);


      // Obtiene los bytes del PDF
    const pdfBytes = doc.output();

    // Crea una URL para el PDF
    const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));

    // Crea una nueva ventana y muestra el PDF en un elemento iframe
    const newWindow = window.open();
    if (newWindow != null) {
      newWindow.document.write('<iframe src="' + pdfUrl + '" style="width:100%;height:100%;" frameborder="0"></iframe>');
      newWindow.document.title = `Comprobante Reserva Apartamentos Anahí.pdf`; // Establece el título de la ventana
    }
  });
}

getClientName(clientId: number) {
  this.clientService.findOneClient(clientId).subscribe(client => {
    this.clientName = `${client.name} ${client.last_name}`;
  });
}

}  

