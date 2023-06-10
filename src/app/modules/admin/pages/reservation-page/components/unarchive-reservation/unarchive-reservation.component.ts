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
}
