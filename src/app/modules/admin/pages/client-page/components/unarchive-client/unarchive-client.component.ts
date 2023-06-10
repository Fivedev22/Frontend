import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IClient } from '../../../../../../interfaces/client.interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ClientService } from '../../../../../../services/client-page.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unarchive-client',
  templateUrl: './unarchive-client.component.html',
  styleUrls: ['./unarchive-client.component.css'],
})
export class UnarchiveClientComponent implements OnInit {
  title = 'client';

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
    private readonly dialog: MatDialog,
    private readonly clientService: ClientService,
    private customPaginator: MatPaginatorIntl,
    private dialogRef: MatDialogRef<UnarchiveClientComponent>
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
    this.clientService.findAllArchived().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  deleteClient(id: number, name: string, last_name: string) {
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
        this.clientService.removeClient(+id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cliente eliminado correctamente',
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

  unarchiveClient(id_client: number, name: string, last_name: string) {
    Swal.fire({
      title: '¿Desea desarchivar el cliente?',
      text: `${name} ${last_name}`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F25D5D',
      cancelButtonColor: '#686868',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.unarchiveClient(+id_client).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cliente desarchivado correctamente',
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
