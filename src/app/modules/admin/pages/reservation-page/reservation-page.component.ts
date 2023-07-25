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
import { IPayment } from 'src/app/interfaces/payment.interface';
import { map } from 'rxjs';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.css'],
})
export class ReservationPageComponent implements OnInit {
  title = 'reservation';

  displayedColumns: string[] = [
    'booking_number',
    'client',
    'property',
    'check_in_date',
    'check_out_date',
    'deposit_amount',
    'is_paid',
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
    const currentDate = new Date();
    this.reservationService.findAllReservations().subscribe((reservations) => {
      const observables = reservations.map((reservation) =>
        this.paymentService.findAllPayments().pipe(
          map((payments) => {
            const hasPayments = payments.some(
              (payment) => payment.booking.id_booking === reservation.id_booking
            );
  
            // Update the local attribute
            reservation.is_paid = hasPayments;
  
            // Call the updateIsPaid function if there are payments
            if (hasPayments) {
              this.reservationService.updateIsPaid(reservation.id_booking!).subscribe(
                () => console.log(`Updated is_paid for reservation ${reservation.id_booking}`),
                (error) => console.error('Error updating is_paid:', error)
              );
            }
  
            return reservation;
          })
        )
      );
  
      forkJoin(observables).subscribe((updatedReservations) => {
        const futureUnpaidReservations = updatedReservations.filter(
          (reservation) => new Date(reservation.check_out_date) > currentDate || !reservation.is_paid
        );

        this.dataSource = new MatTableDataSource<IReservation>(futureUnpaidReservations);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
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
    const id = row.id_booking;
  
    this.paymentService.findAllPayments().subscribe({
      next: (payments) => {
        const hasPayments = payments.some(
          (payment) => payment.booking.id_booking === id
        );
  
        if (hasPayments) {
          Swal.fire({
            icon: 'error',
            title: 'No se puede editar la reserva',
            text: 'La reserva tiene un cobro registrado y ya no puede ser editada.',
          });
        } else {
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
      },
      error: (error) => {
        // Manejo de errores si la llamada al servicio falla
        console.error('Error al obtener los pagos:', error);
      },
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
      doc.text('El Benteveo 990', 10, 25);
      doc.text(
        'Comuna Villa Parque Siquiman, Provincia de Cordoba, Argentina, C.P: 5158',
        10,
        30
      );
      doc.text('Telefono: 0 (3541) 44-8820', 10, 35);
      doc.text('Email: anahiapartamentos@gmail.com', 10, 40);
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const title = 'Comprobante de Reserva';
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Detalles de Reserva', 10, 65);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Fecha de emision: ${data.createdAt}`, 10, 75);
      doc.text(`Nro Reserva: ${data.booking_number}`, 10, 80);
      doc.text(
        `Tipo de Reserva: ${data.booking_type.booking_type_name}`,
        10,
        85
      );
      doc.text(
        `Procedencia de Reserva: ${data.booking_origin.origin_name}`,
        10,
        90
      );
      doc.text(
        `Cliente: ${data.client.name} ${data.client.last_name}`,
        10,
        95
      );
      doc.text(`Propiedad: ${data.property.property_name}`, 10, 100);
      doc.text(`Cantidad adultos: ${data.adults_number}`, 10, 105);
      doc.text(`Cantidad menores: ${data.kids_number}`, 10, 110);
      doc.text(`Cantidad mascotas: ${data.pets_number}`, 10, 115);
      doc.text(`Marca vehiculo: ${data.brand}`, 10, 120);
      doc.text(`Modelo vehiculo: ${data.model}`, 10, 125);
      doc.text(`Patente vehiculo: ${data.licensePlate}`, 10, 130);
      doc.text(`Fecha de check-in: ${data.check_in_date}`, 10, 135);
      doc.text(`Hora de check-in: ${data.check_in_hour}`, 10, 140);
      doc.text(`Fecha de check-out: ${data.check_out_date}`, 10, 145);
      doc.text(`Hora de check-out: ${data.check_out_hour}`, 10, 150);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Importe Detallado', 10, 160);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(
        `Monto de Reserva: $ ${parseFloat(data.starting_price).toLocaleString()}`,
        10,
        170
      );
      doc.text(
        `Cantidad Deposito : $ ${parseFloat(data.deposit_amount).toLocaleString()}`,
        10,
        175
      );
      doc.text(
        `Tipo de Pago (Deposito): ${data.payment_type.payment_type_name}`,
        10,
        180
      );
      doc.text(`Descuento: % ${data.discount}`, 10, 185);
      doc.text(`Monto con descuento: $ ${calculateDiscountedAmount(data.starting_price, data.discount)}`, 10, 190);
      doc.text(
        `Monto a Pagar: $ ${parseFloat(data.booking_amount).toLocaleString()}`,
        10,
        195
      );
      doc.setLineWidth(0.5);
      const lineY = 200;
      doc.line(10, lineY, 200, lineY);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const text = 'Gracias por reservar!';
      const textWidth = doc.getTextWidth(text);
      const pageWidth2 = doc.internal.pageSize.getWidth();
      const textX = (pageWidth - textWidth) / 2;
      doc.text(text, textX, lineY + 15);
      
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
    function calculateDiscountedAmount(startingPrice: string, discount: string | undefined): string {
      const startingPriceNum = parseFloat(startingPrice);
      const discountNum = discount ? parseFloat(discount) : 0;
      const discountedAmount = startingPriceNum - (startingPriceNum * discountNum / 100);
      return discountedAmount.toLocaleString();
    }
  }
  
  

  openPaymentForm(reservationId: number) {
    this.paymentService.findAllPayments().subscribe((payments: IPayment[]) => {
      const hasPreviousPayment = payments.some(payment => payment.booking.id_booking === reservationId);
  
      if (hasPreviousPayment) {
        Swal.fire('Cobro previo', 'Esta reserva ya tiene un cobro registrado.', 'info');
      } else {
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
