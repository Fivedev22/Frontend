import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { IPayment } from '../services/interfaces/payment.interface';
import { PaymentService } from '../services/payment.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent  {
  title = 'payment';

  displayedColumns: string[] = ['payment_number','booking', 'property', 'client', 'payment_amount_total','payment_status', 'actions'];

  dataSource!: MatTableDataSource<IPayment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly paymentService: PaymentService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.findAllPayments();
  }

  findAllPayments() {
    this.paymentService.findAllPayments().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  findAllArchived() {
    this.paymentService.findAllArchived().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  deletePayment(id: number, payment_number: number, payment_amount_total: number) {
    Swal.fire({
      title: '¿Desea eliminar el pago?',
      text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString()}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.removePayment(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pago eliminado correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllPayments();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }

  archivePayment(id: number, payment_number: number, payment_amount_total: number) {
    Swal.fire({
      title: '¿Desea archivar el cobro?',
      text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString()}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Archivar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.archivePayment(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cobro archivado correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllPayments();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }

  unarchivePayment(id: number, payment_number: number, payment_amount_total: number) {
    Swal.fire({
      title: '¿Desea desarchivar el cobro?',
      text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.unarchivePayment(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cobro desarchivado correctamente',
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

  openReservations() {
    this.router.navigate(['admin/reservations']); // Redirige a la página de reservas
  }

  openFormEditPayment(row: IPayment) {
    this.dialog.open(PaymentFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllPayments();
        }
      });
  }


  generatePdfPayment(id: number) {
    this.paymentService.findOnePayment(id).subscribe(data => {
      const doc = new jsPDF();
      const addPageWithBackgroundColor = () => {
        // Establece el color de fondo como durazno
        const lightGreenColor = '#C1FFC1';
        doc.setFillColor(lightGreenColor);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
      };

      // Agrega la primera página con color de fondo
      addPageWithBackgroundColor();
  
      // Agrega el logo y la información de la empresa
      const logo = new Image();
      logo.src = 'https://dummyimage.com/100x100/000/fff&text=Logo';
      doc.addImage(logo, 'PNG', 10, 10, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Apartamentos Anahi', 50, 20);
      doc.setFontSize(12);
      doc.text('El Benteveo 990', 50, 30);
      doc.text('Villa Parque Siquiman, Provincia de Cordoba, Argentina, C.P: 5158', 50, 40);
      doc.text('Telefono: 0 (3541) 44-8820', 50, 50);
      doc.text('Email: anahiapartamentos@gmail.com', 50, 60);

         // Dibuja una línea horizontal debajo de la información de la empresa
         doc.setLineWidth(0.5);
         doc.line(10, 70, 200, 70);
  
  
      // Establece la fuente y el tamaño del título de la factura
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);

      const title = 'Comprobante de Pago';
      const titleWidth = doc.getTextWidth(title); // Calcula el ancho del título

      const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página
      const titleX = (pageWidth - titleWidth) / 2; // Calcula la coordenada X centrada

      doc.text(title, titleX, 80); // Ajusta la coordenada X del texto

  
      // Establece la fuente y el tamaño del texto de detalles de reserva
      doc.setFont('arial', 'bolditalic'); // Cambia la fuente a negrita
      doc.setFontSize(16); // Reduce el tamaño del texto
      doc.text('Detalles del pago', 10, 90); // Agrega el nuevo título
  
      // Establece la fuente y el tamaño del texto de detalles
      doc.setFont('arial', 'italic');
      doc.setFontSize(14);
  
      // Agrega los detalles del pago
      doc.text(`Fecha de emision: ${data.createdAt}`, 10, 100);
      doc.text(`Nro de cobro: ${data.payment_number}`, 10, 110);
      doc.text(`Recibido del cliente: ${data.client.last_name} ${data.client.name}`, 10, 120);
      
      
      doc.setFontSize(16); // Tamaño de fuente más grande (16 puntos)
      doc.setFont('arial', 'bolditalic');
      doc.text('Estadia', 10, 130); // Subtítulo con tamaño de fuente más grande

      doc.setFont('arial', 'italic');
      doc.setFontSize(14); // Restaurar el tamaño de fuente normal
   
      doc.text(`Nro de reserva: ${data.booking.booking_number}`, 10, 140);
      doc.text(`Nombre de la propiedad: ${data.property.property_name}`, 10, 150);
      doc.text(`Fecha de check in: ${data.booking.check_in_date}`, 10, 160);
      doc.text(`Fecha de check out: ${data.booking.check_out_date}`, 10, 170);

 
      doc.setFontSize(16); // Tamaño de fuente más grande (16 puntos)
      doc.setFont('arial', 'bolditalic');
      doc.text('Importe Detallado', 10, 180); // Título "Importe"

      doc.setFont('arial', 'italic');
      doc.setFontSize(14);  

      doc.text(`Precio inicial: $ ${data.booking.starting_price.toLocaleString()}`, 10, 190);
      doc.text(`Cantidad deposito : $ ${data.booking.deposit_amount.toLocaleString()}`, 10, 210);
      doc.text(`Descuento: % ${data.booking.discount}`, 10, 200);
      doc.text(`Monto de reserva: $ ${data.booking.booking_amount.toLocaleString()}`, 10, 220);
      doc.text(`Gastos adicionales: $ ${data.extra_expenses?.toLocaleString()}`, 10, 230);
      doc.text(`Subtotal: $ ${data.payment_amount_subtotal.toLocaleString()}`, 10, 240);
      doc.text(`Total: $ ${data.payment_amount_total.toLocaleString()}`, 10, 250);
  
      // Dibuja una línea horizontal debajo de los detalles
      doc.setLineWidth(0.5);
      const lineY = 260; // Ajusta la coordenada Y para la línea
      doc.line(10, lineY, 200, lineY); // Ajusta la longitud de la línea
  
      // Establece la fuente y el tamaño del texto de agradecimiento
      doc.setFont('Arial', 'italic'); // Utiliza 'italic' para establecer la fuente en cursiva
      doc.setFontSize(20);
      const text = 'Gracias por reservar!';
      const textWidth = doc.getTextWidth(text);
      const pageWidth2 = doc.internal.pageSize.getWidth();
      const x = (pageWidth2 - textWidth) / 2;
      doc.text(text, x, lineY + 10);

  
      // Obtiene los bytes del PDF
      const pdfBytes = doc.output();
  
      // Crea una URL para el PDF
      const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  
      // Crea una nueva ventana y muestra el PDF en un elemento iframe
      const newWindow = window.open();
      if (newWindow != null) {
        newWindow.document.write('<iframe src="' + pdfUrl + '" style="width:100%;height:100%;" frameborder="0"></iframe>');
        newWindow.document.title = 'Comprobante de Pago Apartamentos Anahí.pdf'; // Establece el título de la ventana
      }
    });
 }

}
