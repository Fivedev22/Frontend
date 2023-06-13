import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProperty } from 'src/app/interfaces/property.interface';
import { PropertyService } from 'src/app/services/property-page.service';

@Component({
  selector: 'app-table-pxr',
  templateUrl: './table-pxr.component.html',
  styleUrls: ['./table-pxr.component.css'],
})
export class TablePxrComponent implements OnInit {
  displayedColumns: string[] = ['reference_number', 'property_name', 'actions'];

  dataSource!: MatTableDataSource<IProperty>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly propertyService: PropertyService,
    private dialogRef: MatDialogRef<TablePxrComponent>
  ) {}

  ngOnInit(): void {
    this.findAllProperties();
  }

  findAllProperties() {
    this.propertyService.findAllProperties().subscribe((data) => {
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
  selectProperty(property: any) {
    this.dialogRef.close(property);
  }
}
