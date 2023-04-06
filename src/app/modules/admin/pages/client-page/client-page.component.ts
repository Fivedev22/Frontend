import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClientService } from '../services/client-page.service';
import { IClient } from '../services/interfaces/client.interface';
import Swal from 'sweetalert2';
import { ClientFormComponent } from './components/client-form/client-form.component';


@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css']
})
export class ClientPageComponent implements OnInit {
  title = 'client';

  displayedColumns: string[] = ['name', 'last_name', 'document_number', 'email','phone_number', 'is_foreign', 'province', 'actions'];

  dataSource!: MatTableDataSource<IClient>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly clientService: ClientService
  ) { }

  ngOnInit(): void {
    this.findAllClients();
  }

  findAllClients() {
    this.clientService.findAllClients().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  deleteClient(id: number, name: string, last_name: string) {
    Swal.fire({
      title: '¿Desea eliminar el cliente?',
      text: `${name} ${last_name}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.removeClient(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cliente eliminado correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllClients();
              })
            },
            error(e) {
              alert(e)
            },
          })
      }
    })
  }

  archiveClient(id: number, name: string, last_name: string, client: IClient) {
    Swal.fire({
      title: '¿Desea archivar el cliente?',
      text: `${name} ${last_name}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Archivar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.archiveClient(+id, client)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cliente archivado correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllClients();
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

  openFormCreateClient() {
    this.dialog.open(ClientFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.findAllClients();
        }
      });
  }

  openFormEditClient(row: IClient) {
    this.dialog.open(ClientFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllClients();
        }
      });
  }
}
