import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClientService } from '../services/client-page.service';
import { IClient } from '../services/interfaces/client.interface';
import Swal from 'sweetalert2';
import { ClientFormComponent } from './components/client-form/client-form.component';
import jsPDF from 'jspdf';
import { UnarchiveClientComponent } from './unarchive-client/unarchive-client.component';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css'],
})
export class ClientPageComponent implements OnInit {
  title = 'client';

  displayedColumns: string[] = [
    'name',
    'last_name',
    'document_number',
    'email',
    'phone_number',
    'is_foreign',
    'province',
    'actions',
  ];

  dataSource!: MatTableDataSource<IClient>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly clientService: ClientService,
    private readonly paymentService: PaymentService,
    private readonly reservationService: ReservationService,
    private customPaginator: MatPaginatorIntl
  ) {
    customPaginator.itemsPerPageLabel = 'Filas por página';
  }

  ngOnInit(): void {
    this.findAllClients();
  }

  findAllClients() {
    this.clientService.findAllClients().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  findAllArchived() {
    this.clientService.findAllArchived().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  deleteClient(id: number, name: string, last_name: string) {
    this.reservationService.findAllReservations().subscribe({
      next: (reservations) => {
        this.paymentService.findAllPayments().subscribe({
          next: (payments) => {
            const hasReservations = reservations.some((reservation) => reservation.client.id_client === id);
            const hasPayments = payments.some((payment) => payment.client.id_client === id);
            if (hasReservations || hasPayments) {
              Swal.fire({
                title: 'No se puede eliminar el cliente',
                text: `${name} ${last_name} tiene reservas o cobros asociados.`,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#F25D5D',
              });
            } else {
              Swal.fire({
                title: '¿Desea eliminar el cliente?',
                text: `${name} ${last_name}`,
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#F25D5D',
                cancelButtonColor: '#686868',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.clientService.removeClient(id).subscribe({
                    next: (res) => {
                      Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Cliente eliminado correctamente',
                        showConfirmButton: false,
                        timer: 1800,
                      }).then(() => {
                        this.findAllClients();
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
      },
      error(e) {
        alert(e);
      },
    });
  }
  

  archiveClient(id_client: number, name: string, last_name: string) {
    this.reservationService.findAllReservations().subscribe({
      next: (reservations) => {
        this.paymentService.findAllPayments().subscribe({
          next: (payments) => {
            const hasReservations = reservations.some((reservation) => reservation.client.id_client === id_client);
            const hasPayments = payments.some((payment) => payment.client.id_client === id_client);
            if (hasReservations || hasPayments) {
              Swal.fire({
                title: 'No se puede archivar el cliente',
                text: `${name} ${last_name} tiene reservas o cobros asociados.`,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#F25D5D',
              });
            } else {
              Swal.fire({
                title: '¿Desea archivar el cliente?',
                text: `${name} ${last_name}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Archivar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#F25D5D',
                cancelButtonColor: '#686868',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.clientService.archiveClient(id_client).subscribe({
                    next: (res) => {
                      Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Cliente archivado correctamente',
                        showConfirmButton: false,
                        timer: 1800,
                      }).then(() => {
                        this.findAllClients();
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

  openFormCreateClient() {
    this.dialog
      .open(ClientFormComponent, { width: '800px', disableClose: true })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'save') {
          this.findAllClients();
        }
      });
  }

  openFormEditClient(row: IClient) {
    this.dialog
      .open(ClientFormComponent, {
        width: '800px',
        data: row,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'update') {
          this.findAllClients();
        }
      });
  }

  generatePdfPayments(id: number) {
    this.clientService.getClientPayments(id).subscribe(
      (response: any) => {
        const client = response.client;
        const payments = response. payments;
        
        if (!Array.isArray(payments) || payments.length === 0) {
          Swal.fire('Sin cobros', 'El cliente no tiene ningún cobro registrado.', 'info');
          return;
        }

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
  
        // Establece la fuente y el tamaño del título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);

       
        
        const title = `Historial de Cobros - Cliente: ${client.name} ${client.last_name}`;
        const titleWidth = doc.getTextWidth(title); // Calcula el ancho del título
  
        const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página
        const titleX = (pageWidth - titleWidth) / 2; // Calcula la coordenada X centrada
  
        doc.text(title, titleX, 80); // Ajusta la coordenada X del texto
  
        // Establece la fuente y el tamaño del texto de detalles
        doc.setFont('arial', 'bolditalic');
        doc.setFontSize(15);
  
        // Agrega los detalles de los pagos
        let startY = 100;
        const lineHeight = 10;
  
        payments.forEach((payment, index) => {

          if (index > 0) {
            doc.addPage();
            addPageWithBackgroundColor();
            startY = 10; // Reinicia la posición vertical en la nueva página
          }
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(15);
          doc.text(`Cobro ${index + 1}:`, 10, startY);
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(14); // Establece el tamaño de fuente para el subtítulo
          doc.text('Informacion de cobro:', 20, startY + lineHeight);
        
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Nro de cobro: ${payment.payment_number}`, 20, startY + lineHeight * 2);
          doc.text(`Fecha de cobro: ${payment.createdAt}`, 20, startY + lineHeight * 3);

          doc.setLineWidth(0.5); // Establece el ancho de línea
          doc.setDrawColor(0, 0, 0); // Establece el color de línea (negro)
          doc.line(20, startY + lineHeight * 4, 190, startY + lineHeight * 4); // Dibuja la línea

        
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(14); // Establece el tamaño de fuente para el subtítulo
          doc.text('Detalles Cobro:', 20, startY + lineHeight * 5);
      
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Fecha check-in: ${payment.check_in_date}`, 20, startY + lineHeight * 6);
          doc.text(`Fecha check-out: ${payment.check_out_date}`, 20, startY + lineHeight * 7);
          doc.text(`Precio Inicial: $ ${payment.booking_starting_price.toLocaleString()}`, 20, startY + lineHeight * 8);
          doc.text(`Descuento: % ${payment.booking_discount}`, 20, startY + lineHeight * 9);
          doc.text(`Monto deposito: $ ${payment.deposit_amount.toLocaleString()}`, 20, startY + lineHeight * 10);
          doc.text(`Monto de reserva: $ ${payment.booking_amount.toLocaleString()}`, 20, startY + lineHeight * 11);

          doc.setLineWidth(0.5); // Establece el ancho de línea
          doc.setDrawColor(0, 0, 0); // Establece el color de línea (negro)
          doc.line(20, startY + lineHeight * 12, 190, startY + lineHeight * 12); // Dibuja la línea
        
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(14); // Establece el tamaño de fuente para el subtítulo
          doc.text('Gastos Extras:', 20, startY + lineHeight * 13);
        
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Gastos adicionales: $ ${payment.extra_expenses.toLocaleString()}`, 20, startY + lineHeight * 14);

          doc.setLineWidth(0.5); // Establece el ancho de línea
          doc.setDrawColor(0, 0, 0); // Establece el color de línea (negro)
          doc.line(20, startY + lineHeight * 15, 190, startY + lineHeight * 15); // Dibuja la línea
        
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(14); // Establece el tamaño de fuente para el subtítulo
          doc.text('Importe Final:', 20, startY + lineHeight * 16);
        
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Subtotal: $ ${payment.payment_amount_subtotal.toLocaleString()}`, 20, startY + lineHeight * 17);
          doc.text(`Total: $ ${payment.payment_amount_total.toLocaleString()}`, 20, startY + lineHeight * 18);
          
        
          startY += lineHeight * 19; // Espacio entre cada cobro
        });


        // Obtiene los bytes del PDF
        const pdfBytes = doc.output();
  
        // Crea una URL para el PDF
        const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  
        // Crea una nueva ventana y muestra el PDF en un elemento iframe
        const newWindow = window.open();
        if (newWindow != null) {
          newWindow.document.write('<iframe src="' + pdfUrl + '" style="width:100%;height:100%;" frameborder="0"></iframe>');
          newWindow.document.title = 'Historial de Cobros - Apartamentos Anahí.pdf'; // Establece el título de la ventana
        }
      },
      error => {
        console.error('Error al generar el PDF de los cobros del cliente:', error);
      }
    );
  }
  

  generatePdfBookings(id: number) {
    this.clientService.getClientBookings(id).subscribe(
      (response: any) => {
        const client = response.client;
        const bookings = response.bookings;
        
        if (!Array.isArray(bookings) || bookings.length === 0) {
          Swal.fire('Sin reservas', 'El cliente no tiene ninguna reserva registrada.', 'info');
          return;
        }

        const doc = new jsPDF();
        const addPageWithBackgroundColor = () => {
          // Establece el color de fondo como azul cielo
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
  
        // Establece la fuente y el tamaño del título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);

       
        
        const title = `Historial de Reservas - Cliente: ${client.name} ${client.last_name}`;
        const titleWidth = doc.getTextWidth(title); // Calcula el ancho del título
  
        const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página
        
        const titleX = (pageWidth - titleWidth) / 2; // Calcula la coordenada X centrada

        
  
        doc.text(title, titleX, 80); // Ajusta la coordenada X del texto
  
        // Establece la fuente y el tamaño del texto de detalles
        doc.setFont('arial', 'bolditalic');
        doc.setFontSize(15);
  
        // Agrega los detalles de los pagos
        let startY = 100;
        const lineHeight = 10;
  
        bookings.forEach((booking, index) => {

          if (index > 0) {
            doc.addPage();
            addPageWithBackgroundColor();
            startY = 10; // Reinicia la posición vertical en la nueva página
          }
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(15);
          doc.text(`Reserva ${index + 1}:`, 10, startY);
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(15); // Establece el tamaño de fuente para el subtítulo
          doc.text('Informacion de reserva:', 20, startY + lineHeight);
        
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Nro de reserva: ${booking.booking_number}`, 20, startY + lineHeight * 2);
          doc.text(`Fecha de reserva: ${booking.createdAt}`, 20, startY + lineHeight * 3);
          doc.text(`Cliente: ${client.name} ${client.last_name}`, 20, startY + lineHeight * 4);
          

          doc.setLineWidth(0.5); // Establece el ancho de línea
          doc.setDrawColor(0, 0, 0); // Establece el color de línea (negro)
          doc.line(20, startY + lineHeight * 5, 190, startY + lineHeight * 5); // Dibuja la línea

        
          doc.setFont('arial', 'bolditalic');
          doc.setFontSize(15); // Establece el tamaño de fuente para el subtítulo
          doc.text('Detalles de la reserva:', 20, startY + lineHeight * 6);
      
          doc.setFont('helvetica', 'normal'); // Restablece el estilo de fuente a normal
          doc.setFontSize(12); // Restablece el tamaño de fuente normal
        
          doc.text(`Fecha check-in: ${booking.check_in_date}`, 20, startY + lineHeight * 7);
          doc.text(`Hora check-out: ${booking.check_in_hour}`, 20, startY + lineHeight * 8);
          doc.text(`Fecha check-out: ${booking.check_out_date}`, 20, startY + lineHeight * 9);
          doc.text(`Hora check-out: ${booking.check_out_hour}`, 20, startY + lineHeight * 10);
          doc.text(`Cantidad mayores: ${booking.adults_number}`, 20, startY + lineHeight * 11);
          doc.text(`Cantidad menores: ${booking.kids_number}`, 20, startY + lineHeight * 12);
          doc.text(`Cantidad mascotas: ${booking.pets_number}`, 20, startY + lineHeight * 13);
          doc.text(`Precio Inicial: $ ${booking.starting_price.toLocaleString()}`, 20, startY + lineHeight * 14);
          doc.text(`Descuento: % ${booking.discount}`, 20, startY + lineHeight * 15);
          doc.text(`Monto deposito: $ ${booking.deposit_amount.toLocaleString()}`, 20, startY + lineHeight * 16);
          doc.text(`Monto de reserva: $ ${booking.booking_amount.toLocaleString()}`, 20, startY + lineHeight * 17);
        
          startY += lineHeight * 18; // Espacio entre cada cobro
        });


        // Obtiene los bytes del PDF
        const pdfBytes = doc.output();
  
        // Crea una URL para el PDF
        const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  
        // Crea una nueva ventana y muestra el PDF en un elemento iframe
        const newWindow = window.open();
        if (newWindow != null) {
          newWindow.document.write('<iframe src="' + pdfUrl + '" style="width:100%;height:100%;" frameborder="0"></iframe>');
          newWindow.document.title = 'Historial de Reservas - Apartamentos Anahí.pdf'; // Establece el título de la ventana
        }
      },
      error => {
        console.error('Error al generar el PDF de los cobros del cliente:', error);
      }
    );
  }

  openArchivedClients() {
    const dialogRef = this.dialog.open(UnarchiveClientComponent, {
      width: '400px', // Especifica el ancho del diálogo
      disableClose: true, // Evita que se cierre al hacer clic fuera del diálogo
    });
  
    // Opcionalmente, puedes suscribirte a los eventos del diálogo
    dialogRef.afterClosed().subscribe(result => {
      this.findAllClients();
    });
  }
  
}
