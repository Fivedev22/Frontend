import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { PropertyFormComponent } from './property-form/property-form.component';
import { PropertyService } from '../services/property-page.service';
import { IProperty } from '../services/interfaces/property.interface';


@Component({
  selector: 'app-property-page',
  templateUrl: './property-page.component.html',
  styleUrls: ['./property-page.component.css']
})
export class PropertyPageComponent implements OnInit {
  title = 'property';

  displayedColumns: string[] = ['reference_number', 'property_name', 'property_type', 'province', 'availability_status', 'activity_status', 'actions'];

  dataSource!: MatTableDataSource<IProperty>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly propertyService: PropertyService
  ) { }


  ngOnInit(): void {
    this.findAllProperties();
  }

  findAllProperties() {
    this.propertyService.findAllProperties().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  deleteProperty(id: number, reference_number: number, property_name: string) {
    Swal.fire({
      title: '¿Desea eliminar la propiedad?',
      text: `${reference_number} ${property_name}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.removeProperty(+id)
          .subscribe({
            next: (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Propiedad eliminada correctamente',
                showConfirmButton: false,
                timer: 1800
              }).then(() => {
                this.findAllProperties();
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

  openFormCreateProperty() {
    this.dialog.open(PropertyFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.findAllProperties();
        }
      });
  }

  openFormEditProperty(row: IProperty) {
    this.dialog.open(PropertyFormComponent, { width: '800px', data: row, disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'update') {
          this.findAllProperties();
        }
      });
  }
}
