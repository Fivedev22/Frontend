import { Component, ViewChild } from '@angular/core';
import { IReservation } from '../../../../../../interfaces/reservation.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReservationService } from '../../../../../../services/reservation.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unarchive-reservation',
  templateUrl: './unarchive-reservation.component.html',
  styleUrls: ['./unarchive-reservation.component.css'],
})
export class UnarchiveReservationComponent {
  title = 'reservation';

  displayedColumns: string[] = [
    'booking_number',
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
    private customPaginator: MatPaginatorIntl,
    private dialogRef: MatDialogRef<UnarchiveReservationComponent>
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
    this.reservationService.findAllReservationsArchived().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  unarchiveReservation(
    id: number,
    booking_number: number,
    check_in_date: Date
  ) {
    Swal.fire({
      title: '¿Desea desarchivar la reserva?',
      text: `Reserva N°: ${booking_number} - Check-in: ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.unarchiveReservation(+id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Reserva desarchivada correctamente',
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

  deleteReservation(id: number, booking_number: number, check_in_date: Date) {
    Swal.fire({
      title: '¿Desea eliminar la reserva?',
      text: `Reserva N°: ${booking_number} - Check-in: ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.removeReservation(id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Reserva eliminada correctamente',
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

  viewDetails(reservationId: number) {
    this.reservationService.findOneReservationArchived(reservationId).subscribe(
      (reservation: IReservation) => {
        const popupWindow = window.open('', 'Detalles de la reserva', 'width=400,height=600');
        popupWindow?.document.write(`
          <html>
            <head>
              <style>
                body {
                  font-family: helvetica;
                  background-color: #e8f5e9; /* Agregado: Color verde claro al fondo */
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
              <h2>Detalles de la reserva</h2>
              <p>- Número de reserva: <b>${reservation.booking_number}</b></p>
              <p>- Propiedad: <b>${reservation.property.property_name}</b></p>
              <p>- Cliente: <b>${reservation.client.name} ${reservation.client.last_name}</b></p>
              <p>- Fecha check-in: <b>${reservation.check_in_date}</b></p>
              <p>- Fecha check-out: <b>${reservation.check_out_date}</b></p>
              <p>- Cantidad adultos: <b>${reservation.adults_number}</b></p>
              <p>- Cantidad niños: <b>${reservation.kids_number}</b></p>
              <p>- Mascotas: <b>${reservation.pets_number}</b></p>
              <p>- Marca: <b>${reservation.brand}</b></p>
              <p>- Modelo: <b>${reservation.model}</b></p>
              <p>- Matrícula: <b>${reservation.licensePlate}</b></p>
              <p>- Monto de reserva: <b>$ ${parseFloat(reservation.starting_price).toLocaleString()}</b></p>
              <p>- Descuento: <b>% ${reservation.discount}</b></p>
              <p>- Monto con descuento: <b>$ ${calculateDiscountedAmount(reservation.starting_price, reservation.discount)}</b></p>
              <p>- Monto depósito: <b>${parseFloat(reservation.deposit_amount).toLocaleString()}</b>$ </p>
              <p>- Forma de Pago (depósito): <b>${reservation.payment_type.payment_type_name}</b> </p>
              <p>- Monto a cobrar: <b>$ ${parseFloat(reservation.booking_amount).toLocaleString()}</b></p>
            </body>
          </html>
        `);
      },
      (error: any) => {
        console.error('Error al obtener los detalles de la reserva archivada:', error);
      }
    );
    function calculateDiscountedAmount(startingPrice: string, discount: string | undefined): string {
      const startingPriceNum = parseFloat(startingPrice);
      const discountNum = discount ? parseFloat(discount) : 0;
      const discountedAmount = startingPriceNum - (startingPriceNum * discountNum / 100);
      return discountedAmount.toLocaleString();
    }
  }
  
  
}
