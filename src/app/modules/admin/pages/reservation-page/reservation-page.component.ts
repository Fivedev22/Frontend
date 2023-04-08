import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReservationService } from '../services/reservation.service';
import { IReservation } from '../services/interfaces/reservation.interface';
import Swal from 'sweetalert2';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.css']
})
export class ReservationPageComponent implements OnInit {
  title = 'reservation';

  displayedColumns: string[] = ['booking_number', 'booking_type', 'client', 'property','check_in_date','check_out_date', 'actions'];

  dataSource!: MatTableDataSource<IReservation>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    this.findAllReservations();
  }

  findAllReservations() {
    this.reservationService.findAllReservations().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  deleteReservation(id: number, booking_number: number, check_in_date: Date) {
    Swal.fire({
      title: '¿Desea eliminar la reserva?',
      text: `${booking_number} ${check_in_date}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.removeReservation(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Reserva eliminada correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllReservations();
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

  openFormCreateReservation() {
    this.dialog.open(ReservationFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.findAllReservations();
        }
      });
  }

  openFormEditReservation(row: IReservation) {
    this.dialog.open(ReservationFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllReservations();
        }
      });
  }
}
