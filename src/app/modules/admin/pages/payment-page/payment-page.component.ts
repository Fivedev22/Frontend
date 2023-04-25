import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { IPayment } from '../services/interfaces/payment.interface';
import { PaymentService } from '../services/payment.service';
import Swal from 'sweetalert2';

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
    private readonly paymentService: PaymentService
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
      text: `Cobro Nro: ${payment_number} - Monto Total: ${payment_amount_total}`,
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
      text: `Cobro Nro: ${payment_number} - Monto Total: ${payment_amount_total}`,
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
      text: `Cobro Nro: ${payment_number} - Monto Total: ${payment_amount_total}`,
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

  openFormCreatePayment() {
    this.dialog.open(PaymentFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.findAllPayments();
        }
      });
  }

  openFormEditPayment(row: IPayment) {
    this.dialog.open(PaymentFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllPayments();
        }
      });
  }
}
