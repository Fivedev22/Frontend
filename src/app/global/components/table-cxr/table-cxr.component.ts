import { Component, OnInit, ViewChild } from '@angular/core';
import { IClient } from '../../../interfaces/client.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClientService } from '../../../services/client-page.service';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-cxr',
  templateUrl: './table-cxr.component.html',
  styleUrls: ['./table-cxr.component.css'],
})
export class TableCxrComponent implements OnInit {
  selectedRowData: any;
  displayedColumns: string[] = [
    'name',
    'last_name',
    'document_number',
    'actions',
  ];
  dataSource!: MatTableDataSource<IClient>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly clientService: ClientService,
    private dialogRef: MatDialogRef<TableCxrComponent>
  ) {}

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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }
  selectPerson(client: any) {
    this.dialogRef.close(client);
  }

  showReservations(row: any): void {
    const clientId = row.id_client; // Asegúrate de que la propiedad 'id_client' exista dentro del objeto 'row'
    this.clientService.getClientBookings(clientId).subscribe(
      (response: any) => {
        const client = response.client;
        const bookings = response.bookings;
  
        if (!Array.isArray(bookings) || bookings.length === 0) {
          Swal.fire(
            'Sin reservas',
            'El cliente no tiene ninguna reserva registrada.',
            'info'
          );
          return;
        }
  
        const clientName = `${client.name} ${client.last_name}`;
        let message = `
          <div style="font-family: Arial, sans-serif; font-size: 16px; background-color: #e6f3e8; padding: 10px;">
            <p>${clientName}</p>
            <p>Reservas:</p>
            <ul style="list-style-type: square; margin-left: 20px;">
        `;
  
        // Construir la lista de reservas con fechas
        bookings.forEach((booking: any) => {
          const checkInDate = new Date(booking.check_in_date).toLocaleDateString();
          const checkOutDate = new Date(booking.check_out_date).toLocaleDateString();
          message += `<li>${checkInDate} - ${checkOutDate}</li>`;
        });
  
        message += `
            </ul>
          </div>
        `;
  
        // Define las dimensiones del popup
        const popupWidth = 400;
        const popupHeight = 300;
  
        // Calcula la posición del popup para centrarlo en la pantalla
        const leftPosition = (window.innerWidth - popupWidth) / 2;
        const topPosition = (window.innerHeight - popupHeight) / 2;
  
        // Abre el popup
        const popup = window.open('', '_blank', `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`);
        popup?.document.write(message);
      },
      (error) => {
        // Manejar errores, si es necesario
      }
    );
  }
  
  
  
  }

