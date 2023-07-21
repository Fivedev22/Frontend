import { Component, ViewChild } from '@angular/core';
import { IPayment } from '../../../../../../interfaces/payment.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { PaymentService } from '../../../../../../services/payment.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unarchive-payment',
  templateUrl: './unarchive-payment.component.html',
  styleUrls: ['./unarchive-payment.component.css'],
})
export class UnarchivePaymentComponent {
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
    private customPaginator: MatPaginatorIntl,
    private dialogRef: MatDialogRef<UnarchivePaymentComponent>
  ) {
    customPaginator.itemsPerPageLabel = 'Filas por página';
  }

  ngOnInit(): void {
    this.findAllArchived();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  findAllArchived() {
    this.paymentService.findAllArchived().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  unarchivePayment(
    id: number,
    payment_number: number,
    payment_amount_total: number
  ) {
    Swal.fire({
      title: '¿Desea desarchivar el cobro?',
      text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString()}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.unarchivePayment(+id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cobro desarchivado correctamente',
              showConfirmButton: false,
              timer: 1800,
            }).then(() => {
              this.findAllArchived();
            });
          },
          error(e) {
            alert(e);
          },
        });
      }
    });
  }

  deletePayment(
    id: number,
    payment_number: number,
    payment_amount_total: number
  ) {
    Swal.fire({
      title: '¿Desea eliminar el cobro?',
      text: `Cobro N°: ${payment_number} - Monto Total: $ ${payment_amount_total.toLocaleString()}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.removePayment(+id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cobro eliminado correctamente',
              showConfirmButton: false,
              timer: 1800,
            }).then(() => {
              this.findAllArchived();
            });
          },
          error(e) {
            alert(e);
          },
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  viewDetails(paymentId: number) {
    this.paymentService.findOneArchived(paymentId).subscribe(
      (payment: IPayment) => {
        const details = `
          Número de cobro: ${payment.payment_number}
          Fecha de creación: ${payment.createdAt}
          Reserva: ${payment.booking.booking_number}
          Cliente: ${payment.client.name} ${payment.client.last_name}
          Inmueble: ${payment.property.property_name}
          Fecha de check-in: ${payment.check_in_date}
          Fecha de check-out: ${payment.check_out_date}
          Precio inicial de la reserva: ${payment.booking_starting_price}
          Descuento de la reserva: ${payment.booking_discount || 'N/A'}
          Monto del depósito: ${payment.deposit_amount}
          Monto total de la reserva: ${payment.booking_amount}
          Gastos adicionales: ${payment.extra_expenses || 'N/A'}
          Total del cobro: ${payment.payment_amount_total}
          Tipo de pago: ${payment.payment_type.payment_type_name}
          Estado del pago: ${payment.payment_status.payment_status_name}
        `;
  
        const popupWindow = window.open('', 'Detalles del cobro', 'width=400,height=600');
        popupWindow?.document.write(`
          <html>
            <head>
              <title>Detalles del cobro</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
              </style>
            </head>
            <body>
              <h2>Detalles del cobro</h2>
              <pre>${details}</pre>
            </body>
          </html>
        `);
      },
      (error: any) => {
        console.error('Error al obtener los detalles del cobro archivado:', error);
      }
    );
  }
  
}
