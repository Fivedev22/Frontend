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
import { PaymentFormComponent } from '../payment-page/payment-form/payment-form.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.css']
})
export class ReservationPageComponent implements OnInit {
  title = 'reservation';

  displayedColumns: string[] = ['booking_number', 'booking_type', 'client', 'property','check_in_date','check_out_date', 'actions'];

  dataSource!: MatTableDataSource<IReservation>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly reservationService: ReservationService,
    private router: Router,
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
  
      // Agrega el logo y la información de la empresa
      const logo = new Image();
      logo.src = 'https://dummyimage.com/100x100/000/fff&text=Logo';
      doc.addImage(logo, 'PNG', 10, 10, 30, 30);
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
      // Establece la fuente y el tamaño del título de la factura
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);

      const title = 'Comprobante de Reserva';
      const titleWidth = doc.getTextWidth(title); // Calcula el ancho del título

      const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página
      const titleX = (pageWidth - titleWidth) / 2; // Calcula la coordenada X centrada

      doc.text(title, titleX, 80); // Ajusta la coordenada X del texto

  
      // Establece la fuente y el tamaño del texto de detalles de reserva
      doc.setFont('helvetica', 'bold'); // Cambia la fuente a negrita
      doc.setFontSize(14); // Reduce el tamaño del texto
      doc.text('Detalles de Reserva', 10, 90); // Agrega el nuevo título
  
      // Establece la fuente y el tamaño del texto de detalles
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
  
      // Agrega los detalles de la reserva
      doc.text(`Fecha de emision: ${data.createdAt}`, 10, 110);
      doc.text(`Reserva Nro: ${data.booking_number}`, 10, 100);
      doc.text(`Tipo de Reserva: ${data.booking_type.booking_type_name}`, 10, 120);
      doc.text(`Procedencia de Reserva: ${data.booking_origin.origin_name}`, 10, 130);
      doc.text(`Cliente: ${data.client.name} ${data.client.last_name}`, 10, 140);
      doc.text(`Propiedad: ${data.property.property_name}`, 10, 150);
      doc.text(`Adultos: ${data.adults_number}`, 10, 160);
      doc.text(`Menores: ${data.kids_number}`, 10, 170);
      doc.text(`Mascotas: ${data.pets_number}`, 10, 180);
      doc.text(`Fecha de check-in: ${data.check_in_date}`, 10, 190);
      doc.text(`Hora de check-in: ${data.check_in_hour}`, 10, 200);
      doc.text(`Fecha de check-out: ${data.check_out_date}`, 10, 210);
      doc.text(`Hora de check-out: ${data.check_out_hour}`, 10, 220);
      doc.text(`Precio Inicial: $ ${data.starting_price}`, 10, 230);
      doc.text(`Descuento: % ${data.discount}`, 10, 240);
      doc.text(`Cantidad Deposito : $ ${data.deposit_amount}`, 10, 250);
      doc.text(`Cantidad Deposito Estimado: $ ${data.estimated_amount_deposit}`, 10, 260);
      doc.text(`Monto de Reserva: $ ${data.booking_amount}`, 10, 270);
  
      // Dibuja una línea horizontal debajo de los detalles
      doc.setLineWidth(0.5);
      const lineY = 280; // Ajusta la coordenada Y para la línea
      doc.line(10, lineY, 200, lineY); // Ajusta la longitud de la línea
  
      // Establece la fuente y el tamaño del texto de agradecimiento
      doc.setFont('Arial', 'bolditalic'); // Utiliza 'italic' para establecer la fuente en cursiva
      doc.setFontSize(18);
      doc.text('Gracias por reservar!', 10, lineY + 10); // Ajusta la coordenada Y del texto

  
      // Obtiene los bytes del PDF
      const pdfBytes = doc.output();
  
      // Crea una URL para el PDF
      const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  
      // Crea una nueva ventana y muestra el PDF en un elemento iframe
      const newWindow = window.open();
      if (newWindow != null) {
        newWindow.document.write('<iframe src="' + pdfUrl + '" style="width:100%;height:100%;" frameborder="0"></iframe>');
        newWindow.document.title = 'Comprobante Reserva Apartamentos Anahí.pdf'; // Establece el título de la ventana
      }
    });
  }


openPaymentForm(reservationId: number) {
  const dialogRef = this.dialog.open(PaymentFormComponent, { width: '800px', disableClose: true, data: { reservationId: reservationId } });
  dialogRef.afterClosed().subscribe(result => {
    if (result === 'save') {
      // Actualizar la lista de cobros
      this.router.navigate(['/payments']); // Redirigir a la página de cobros
    }
  });
}

  
  
}  

