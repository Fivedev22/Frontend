import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReservationService } from '../../../../services/reservation.service';
import { IReservation } from '../../../../interfaces/reservation.interface';
import Swal from 'sweetalert2';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import jsPDF from 'jspdf';
import { PaymentFormComponent } from '../payment-page/components/payment-form/payment-form.component';
import { Router } from '@angular/router';
import { ContractUploadComponent } from './components/contract-upload/contract-upload.component';
import { PaymentService } from '../../../../services/payment.service';
import { UnarchiveReservationComponent } from './components/unarchive-reservation/unarchive-reservation.component';

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.css'],
})
export class ReservationPageComponent implements OnInit {
  title = 'reservation';

  displayedColumns: string[] = [
    'booking_number',
    'booking_type',
    'client',
    'property',
    'check_in_date',
    'check_out_date',
    'actions',
  ];

  dataSource!: MatTableDataSource<IReservation>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly reservationService: ReservationService,
    private readonly paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.findAllReservations();
  }

  findAllReservations() {
    this.reservationService.findAllReservations().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  archiveReservation(id: number, booking_number: number, check_in_date: Date) {
    this.paymentService.findAllPayments().subscribe({
      next: (payments) => {
        const hasPayments = payments.some(
          (payment) => payment.booking.id_booking === id
        );
        if (hasPayments) {
          Swal.fire({
            title: 'No se puede archivar la reserva',
            text: `La reserva N°: ${booking_number} tiene un cobro asociado.`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#F25D5D',
          });
        } else {
          Swal.fire({
            title: '¿Desea archivar la reserva?',
            text: `Reserva N°: ${booking_number} - Fecha Check-in: ${check_in_date}`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Archivar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.reservationService.archiveReservation(id).subscribe({
                next: (res) => {
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Reserva archivada correctamente',
                    showConfirmButton: false,
                    timer: 1800,
                  }).then(() => {
                    this.findAllReservations();
                  });
                },
                error(e) {
                  alert(e);
                },
              });
            }
          });
        }
      },
      error(e) {
        alert(e);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  openFormCreateReservation() {
    this.dialog
      .open(ReservationFormComponent, {
        width: '800px',
        height: '600px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'save') {
          this.findAllReservations();
        }
      });
  }

  openFormEditReservation(row: IReservation) {
    this.dialog
      .open(ReservationFormComponent, {
        width: '800px',
        height: '600px',
        data: row,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'update') {
          this.findAllReservations();
        }
      });
  }

  generatePdf(id: number) {
    this.reservationService.findOneReservation(id).subscribe((data) => {
      const doc = new jsPDF();

      const addPageWithBackgroundColor = () => {
        const lightColor = '#FFFFFF';
        doc.setFillColor(lightColor);
        doc.rect(
          0,
          0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
      };

      addPageWithBackgroundColor();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text('Apartamentos Anahi', 10, 20);
      doc.setFontSize(12);
      doc.text('El Benteveo 990', 10, 30);
      doc.text(
        'Comuna Villa Parque Siquiman, Provincia de Cordoba, Argentina, C.P: 5158',
        10,
        40
      );
      doc.text('Telefono: 0 (3541) 44-8820', 10, 50);
      doc.text('Email: anahiapartamentos@gmail.com', 10, 60);
      doc.setLineWidth(0.5);
      doc.line(10, 70, 200, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const title = 'Comprobante de Reserva';
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Detalles de reserva', 10, 90);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Fecha de emision: ${data.createdAt}`, 10, 110);
      doc.text(`Reserva Nro: ${data.booking_number}`, 10, 100);
      doc.text(
        `Tipo de Reserva: ${data.booking_type.booking_type_name}`,
        10,
        120
      );
      doc.text(
        `Procedencia de Reserva: ${data.booking_origin.origin_name}`,
        10,
        130
      );
      doc.text(
        `Cliente: ${data.client.name} ${data.client.last_name}`,
        10,
        140
      );
      doc.text(`Propiedad: ${data.property.property_name}`, 10, 150);
      doc.text(`Cantidad adultos: ${data.adults_number}`, 10, 160);
      doc.text(`Cantidad menores: ${data.kids_number}`, 10, 170);
      doc.text(`Cantidad mascotas: ${data.pets_number}`, 10, 180);
      doc.text(`Fecha de check-in: ${data.check_in_date}`, 10, 190);
      doc.text(`Hora de check-in: ${data.check_in_hour}`, 10, 200);
      doc.text(`Fecha de check-out: ${data.check_out_date}`, 10, 210);
      doc.text(`Hora de check-out: ${data.check_out_hour}`, 10, 220);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Importe Detallado', 10, 230);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(
        `Monto de Reserva: $ ${data.starting_price.toLocaleString()}`,
        10,
        240
      );
      doc.text(
        `Cantidad Deposito : $ ${data.deposit_amount.toLocaleString()}`,
        10,
        250
      );
      doc.text(`Descuento: % ${data.discount}`, 10, 260);
      doc.text(
        `Monto a Cobrar: $ ${data.booking_amount.toLocaleString()}`,
        10,
        270
      );
      doc.setLineWidth(0.5);
      const lineY = 280;
      doc.line(10, lineY, 200, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const text = 'Gracias por reservar!';
      const textWidth = doc.getTextWidth(text);
      const pageWidth2 = doc.internal.pageSize.getWidth();
      const x = (pageWidth2 - textWidth) / 2;
      doc.text(text, x, lineY + 10);
      const pdfBytes = doc.output();
      const pdfUrl = URL.createObjectURL(
        new Blob([pdfBytes], { type: 'application/pdf' })
      );
      const newWindow = window.open();
      if (newWindow != null) {
        newWindow.document.write(
          '<iframe src="' +
            pdfUrl +
            '" style="width:100%;height:100%;" frameborder="0"></iframe>'
        );
        newWindow.document.title =
          'Comprobante de Reserva - Apartamentos Anahí.pdf';
      }
    });
  }

  openPaymentForm(reservationId: number) {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      width: '800px',
      height: '600px',
      disableClose: true,
      data: { reservationId: reservationId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'save') {
        this.router.navigate(['admin/payments']);
      }
    });
  }

  openUploadContract(id_booking: number) {
    const dialogRef = this.dialog.open(ContractUploadComponent, {
      data: { id_booking },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        Swal.fire({
          title: 'Éxito',
          text: 'Contrato de alquiler subido exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      }
    });
  }

  openArchivedReservations() {
    this.reservationService
      .findAllReservationsArchived()
      .subscribe((archivedReservations) => {
        if (archivedReservations && archivedReservations.length > 0) {
          this.dialog
            .open(UnarchiveReservationComponent, {
              width: '1000px',
              disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
              this.findAllReservations();
            });
        } else {
          Swal.fire('No hay reservaciones archivadas/canceladas', '', 'info');
        }
      });
  }
}
