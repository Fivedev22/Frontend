import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PropertyService } from '../../../services/property-page.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-inventory',
  templateUrl: './upload-inventory.component.html',
  styleUrls: ['./upload-inventory.component.css'],
})
export class UploadInventoryComponent implements OnInit {
  inventories: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<UploadInventoryComponent>,
    private propertyService: PropertyService,
    @Inject(MAT_DIALOG_DATA) public data: { id_property: number }
  ) {}

  ngOnInit() {
    this.getInventory(); // Llama al método getContracts al iniciar el componente
  }

  onFileSelected(files: FileList | null) {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      this.uploadInventory(selectedFile);
    }
  }

  uploadInventory(file: File) {
    this.propertyService.getPropertyInventory(this.data.id_property).subscribe(
      (inventories) => {
        if (inventories && inventories.length > 0) {
          Swal.fire({
            title: 'Error',
            text: 'Ya existe un inventario para esta propiedad',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        } else {
          this.propertyService
            .uploadInventory(this.data.id_property, file)
            .subscribe(
              () => {
                this.dialogRef.close('success');
              },
              (error) => {
                // Manejar el error apropiadamente
              }
            );
        }
      },
      (error) => {
        // Manejar el error apropiadamente
      }
    );
  }

  getInventory() {
    this.propertyService.getPropertyInventory(this.data.id_property).subscribe(
      (response) => {
        console.log(response);
        this.inventories = response;
      },
      (error) => {
        // Manejar el error apropiadamente
      }
    );
  }

  getDownloadUrl(inventory: any): string {
    const baseUrl = 'http://localhost:3000/uploads/'; // Ruta base de la carpeta de contratos en el servidor
    const filename = inventory.filename; // Nombre del archivo del contrato
    return baseUrl + filename;
  }

  deleteInventory(inventory: any) {
    Swal.fire({
      title: '¿Desea eliminar el inventario?',
      text: 'Esta acción eliminará el inventario',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.deleteInventory(inventory.id).subscribe(
          () => {
            Swal.fire(
              'Eliminado',
              'El inventario ha sido eliminado',
              'success'
            );
            this.getInventory();
          },
          (error) => {
            // Manejar el error apropiadamente
          }
        );
      }
    });
  }
}
