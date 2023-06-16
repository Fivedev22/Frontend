import { Component, ViewChild } from '@angular/core';
import { PropertyService } from '../../../../../../services/property-page.service';
import { IProperty } from '../../../../../../interfaces/property.interface';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unarchive-property',
  templateUrl: './unarchive-property.component.html',
  styleUrls: ['./unarchive-property.component.css'],
})
export class UnarchivePropertyComponent {
  title = 'property';

  displayedColumns: string[] = [
    'reference_number',
    'property_name',
    'property_type',
    'province',
    'actions',
  ];

  dataSource!: MatTableDataSource<IProperty>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialog: MatDialog,
    private readonly propertyService: PropertyService,
    private customPaginator: MatPaginatorIntl,
    private dialogRef: MatDialogRef<UnarchivePropertyComponent>
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
    this.propertyService.findAllArchived().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  unarchiveProperty(
    id: number,
    reference_number: number,
    property_name: string
  ) {
    Swal.fire({
      title: '¿Desea desarchivar el inmueble?',
      text: `Nro de Referencia: ${reference_number} - Nombre/Numeración: ${property_name}`,
      icon: 'error',
      showCancelButton: true,

      confirmButtonText: 'Desarchivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.unarchiveProperty(+id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Inmueble desarchivado correctamente',
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

  deleteProperty(id: number, reference_number: number, property_name: string) {
    Swal.fire({
      title: '¿Desea eliminar el inmueble definitivamente?',
      text: `${reference_number} ${property_name}`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.removeProperty(id).subscribe({
          next: (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Inmueble eliminado correctamente',
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

  viewDetails(clientId: number) {
    this.propertyService.findOneArchived(clientId).subscribe(
      (property: IProperty) => {
        const details = `
          Número de referencia: ${property.reference_number}
          Nombre del inmueble: ${property.property_name}
          Tipo de inmueble: ${property.property_type.property_type_name}
          Metros cuadrados: ${property.square_meter}
          Dirección: ${property.street} ${property.street_number}
          Piso/Edificio: ${property.building_floor}
          Provincia: ${property.province.province_name}
          Ciudad: ${property.town}
          Distrito: ${property.district}
          Número de habitaciones: ${property.rooms_number}
          Número de baños: ${property.bathrooms_number}
          Internet: ${property.internet ? 'Sí' : 'No'}
          Piscina: ${property.pool ? 'Sí' : 'No'}
          Cocina: ${property.kitchen ? 'Sí' : 'No'}
          Equipamiento de lavandería: ${property.laundry_equipment ? 'Sí' : 'No'}
          Patio: ${property.yard ? 'Sí' : 'No'}
          Estacionamiento: ${property.parking ? 'Sí' : 'No'}
          Acceso para discapacitados: ${property.disabled_access ? 'Sí' : 'No'}
          Camas para niños: ${property.kids_beds ? 'Sí' : 'No'}
          Estado de disponibilidad: ${property.availability_status.availability_status_name}
          Estado de actividad: ${property.activity_status.activity_status_name}
        `;
  
        const popupWindow = window.open('', 'Detalles del inmueble', 'width=400,height=600');
        popupWindow?.document.write(`
          <html>
            <head>
              <title>Detalles del inmueble</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
              </style>
            </head>
            <body>
              <h2>Detalles del inmueble</h2>
              <pre>${details}</pre>
            </body>
          </html>
        `);
      },
      (error: any) => {
        console.error('Error al obtener los detalles del inmueble archivado:', error);
      }
    );
  }
  
  
}
