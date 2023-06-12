import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { IPayment } from '../../../../interfaces/payment.interface';
import { PaymentService } from '../../../../services/payment.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import { UnarchivePaymentComponent } from './components/unarchive-payment/unarchive-payment.component';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css'],
})
export class PaymentPageComponent {
  title = 'payment';

  displayedColumns: string[] = [
    'payment_number',
    'booking',
    'property',
    'client',
    'payment_amount_total',
    'payment_status',
    'actions',
  ];

  dataSource!: MatTableDataSource<IPayment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.findAllPayments();
  }

  findAllPayments() {
    this.paymentService.findAllPayments().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  archivePayment(
    id: number,
    payment_number: number,
    payment_amount_total: number
  ) {
    // Verificar si el ID del cobro está presente en los pagos realizados
    this.paymentService.findAllPaymentsPaid().subscribe((payments) => {
      const paymentExists = payments.some((payment) => payment.id_payment === id);
  
      if (paymentExists) {
        // Mostrar mensaje de error indicando que no se puede archivar el cobro
        Swal.fire({
          title: 'No se puede archivar',
          text: 'El cobro seleccionado ya ha sido pagado y no se puede archivar.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      } else {
        // Mostrar el mensaje de confirmación para archivar el cobro
        Swal.fire({
          title: '¿Desea archivar/cancelar el cobro?',
          text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString()}`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Archivar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.paymentService.archivePayment(+id).subscribe({
              next: (res) => {
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Cobro archivado/cancelado correctamente',
                  showConfirmButton: false,
                  timer: 1800,
                }).then(() => {
                  this.findAllPayments();
                });
              },
              error(e) {
                alert(e);
              },
            });
          }
        });
      }
    });
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  openReservations() {
    this.router.navigate(['admin/reservations']);
  }

  openFormEditPayment(row: IPayment) {
    this.dialog
      .open(PaymentFormComponent, {
        width: '800px', height: '600px',
        data: row,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'update') {
          this.findAllPayments();
        }
      });
  }

  generatePdfPayment(id: number) {
    this.paymentService.findOnePayment(id).subscribe((data) => {
      const doc = new jsPDF();
      const addPageWithBackgroundColor = () => {
        const lightGreenColor = '#C1FFC1';
        doc.setFillColor(lightGreenColor);
        doc.rect(
          0,
          0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight(),
          'F'
        );
      };
      addPageWithBackgroundColor();
      const logo = new Image();
      logo.src = 'https://dummyimage.com/100x100/000/fff&text=Logo';
      doc.addImage(logo, 'PNG', 10, 10, 30, 30);
      doc.setFont('helvetica', 'bold');
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
      const title = 'Comprobante de Pago';
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 80);
      doc.setFont('arial', 'bolditalic');
      doc.setFontSize(16);
      doc.text('Detalles del pago', 10, 90);
      doc.setFont('arial', 'italic');
      doc.setFontSize(14);
      doc.text(`Fecha de emision: ${data.createdAt}`, 10, 100);
      doc.text(`Nro de cobro: ${data.payment_number}`, 10, 110);
      doc.text(
        `Recibido del cliente: ${data.client.last_name} ${data.client.name}`,
        10,
        120
      );
      doc.setFontSize(16);
      doc.setFont('arial', 'bolditalic');
      doc.text('Estadia', 10, 130);
      doc.setFont('arial', 'italic');
      doc.setFontSize(14);
      doc.text(`Nro de reserva: ${data.booking.booking_number}`, 10, 140);
      doc.text(
        `Nombre de la propiedad: ${data.property.property_name}`,
        10,
        150
      );
      doc.text(`Fecha de check in: ${data.booking.check_in_date}`, 10, 160);
      doc.text(`Fecha de check out: ${data.booking.check_out_date}`, 10, 170);
      doc.setFontSize(16);
      doc.setFont('arial', 'bolditalic');
      doc.text('Importe Detallado', 10, 180);
      doc.setFont('arial', 'italic');
      doc.setFontSize(14);
      doc.text(
        `Monto de Reserva: $ ${data.booking.starting_price.toLocaleString()}`,
        10,
        190
      );
      doc.text(
        `Cantidad deposito : $ ${data.booking.deposit_amount.toLocaleString()}`,
        10,
        210
      );
      doc.text(`Descuento: % ${data.booking.discount}`, 10, 200);
      doc.text(
        `Monto a Cobrar: $ ${data.booking.booking_amount.toLocaleString()}`,
        10,
        220
      );
      doc.text(
        `Gastos adicionales: $ ${data.extra_expenses?.toLocaleString()}`,
        10,
        230
      );
      doc.text(
        `Subtotal: $ ${data.payment_amount_subtotal.toLocaleString()}`,
        10,
        240
      );
      doc.text(
        `Total: $ ${data.payment_amount_total.toLocaleString()}`,
        10,
        250
      );
      doc.setLineWidth(0.5);
      const lineY = 260;
      doc.line(10, lineY, 200, lineY);
      doc.setFont('Arial', 'italic');
      doc.setFontSize(20);
      const text = 'Gracias por visitarnos!';
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
        newWindow.document.title = 'Comprobante de Pago Apartamentos Anahí.pdf';
      }
    });
  }

  openArchivedPayments() {
    this.dialog
      .open(UnarchivePaymentComponent, {
        width: '800px', height: '600px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        this.findAllPayments();
      });
  }
}
