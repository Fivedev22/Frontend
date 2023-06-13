import { Component, OnInit, ViewChild } from '@angular/core';
import { IClient } from '../../../interfaces/client.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClientService } from '../../../services/client-page.service';
import { MatDialogRef } from '@angular/material/dialog';

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
}
