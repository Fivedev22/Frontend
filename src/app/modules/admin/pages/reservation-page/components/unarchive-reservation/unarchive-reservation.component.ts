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
        const details = `
          Número de reserva: ${reservation.booking_number}
          Fecha de creación: ${reservation.createdAt}
          Tipo de reserva: ${reservation.booking_type.booking_type_name}
          Procedencia de la reserva: ${reservation.booking_origin.origin_name}
          Cliente: ${reservation.client.name} ${reservation.client.last_name}
          Inmueble: ${reservation.property.property_name}
          Número de adultos: ${reservation.adults_number}
          Número de niños: ${reservation.kids_number}
          Número de mascotas: ${reservation.pets_number || 'N/A'}
          Marca auto: ${reservation.brand}
          Modelo auto: ${reservation.model}
          Patente auto: ${reservation.licensePlate}
          Fecha de check-in: ${reservation.check_in_date}
          Fecha de check-out: ${reservation.check_out_date}
          Hora de check-in: ${reservation.check_in_hour}
          Hora de check-out: ${reservation.check_out_hour}
          Monto de reserva: ${reservation.starting_price}
          Descuento: % ${reservation.discount || 'N/A'}
          Monto del depósito: $ ${reservation.deposit_amount}
          Monto estimado del depósito: $ ${reservation.estimated_amount_deposit}
          Monto a cobrar: $ ${reservation.booking_amount}
        `;
  
        const popupWindow = window.open('', 'Detalles de la reserva', 'width=400,height=600');
        popupWindow?.document.write(`
          <html>
            <head>
              <title>Detalles de la reserva</title>
              <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: lightgreen; /* Agregar fondo verde claro */
              }
              pre {
                text-align: left; /* Ubicar el texto a la izquierda */
                margin-left: 0; /* Eliminar margen izquierdo */
              }
            </style>
            </head>
            <body>
              <h2>Detalles de la reserva</h2>
              <pre>${details}</pre>
            </body>
          </html>
        `);
      },
      (error: any) => {
        console.error('Error al obtener los detalles de la reserva archivada:', error);
      }
    );
  }
  
}
