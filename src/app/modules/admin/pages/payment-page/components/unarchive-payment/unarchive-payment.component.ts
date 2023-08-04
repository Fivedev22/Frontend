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
    'booking_starting_price',
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
        const popupWindow = window.open(
          '',
          'Detalles del cobro',
          'width=400,height=600'
        );
        popupWindow?.document.write(`
          <html>
            <head>
              <style>
                body {
                  font-family: helvetica;
                  background-color: #fff; 
                }
                h2 {
                  font-size: 16px;
                  font-style: normal;
                }
                p {
                  font-size: 14px;
                  font-style: normal;
                }
              </style>
            </head>
            <body>
              <h2>Detalles del cobro</h2>
              <p>- Número de cobro: <b>${payment.payment_number}</b></p>
              <p>- Fecha de creación: <b>${payment.createdAt}</b></p>
              <p>- Reserva: <b>${payment.booking.booking_number}</b></p>
              <p>- Cliente: <b>${payment.client.name} ${
          payment.client.last_name
        }</b></p>
              <p>- Inmueble: <b>${payment.property.property_name}</b></p>
              <p>- Fecha de check-in: <b>${payment.check_in_date}</b></p>
              <p>- Fecha de check-out: <b>${payment.check_out_date}</b></p>
              <p>- Monto de la reserva: <b> $ ${parseFloat(
                payment.booking_starting_price
              ).toLocaleString()}</b></p>
              <p>- Descuento de la reserva: <b> % ${
                payment.booking_discount || 'N/A'
              }</b></p>
              <p>- Monto con descuento: <b>$ ${calculateDiscountedAmount(
                payment.booking_starting_price,
                payment.booking_discount
              )}</b></p>
              <p>- Monto del depósito: <b> $ ${parseFloat(
                payment.deposit_amount
              ).toLocaleString()}</b></p>
              <p>- Monto a cobrar: <b> $ ${parseFloat(
                payment.booking_amount
              ).toLocaleString()}</b></p>
              <p>- Gastos adicionales: <b> $ ${parseFloat(
                payment.extra_expenses || 'N/A'
              ).toLocaleString()}</b></p>
              <p>- Total: <b> $ ${parseFloat(
                payment.payment_amount_total
              ).toLocaleString()}</b></p>
              <p>- Tipo de pago: <b>${
                payment.payment_type.payment_type_name
              }</b></p>
            </body>
          </html>
        `);
      },
      (error: any) => {
        console.error(
          'Error al obtener los detalles del cobro archivado:',
          error
        );
      }
    );
    function calculateDiscountedAmount(
      startingPrice: string,
      discount: string | undefined
    ): string {
      const startingPriceNum = parseFloat(startingPrice);
      const discountNum = discount ? parseFloat(discount) : 0;
      const discountedAmount =
        startingPriceNum - (startingPriceNum * discountNum) / 100;
      return discountedAmount.toLocaleString();
    }
  }
}
