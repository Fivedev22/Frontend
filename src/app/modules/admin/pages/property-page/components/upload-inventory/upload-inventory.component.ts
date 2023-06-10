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
  selectedFile: File | null = null;
  isUploadButtonDisabled: boolean = true;
  constructor(
    private dialogRef: MatDialogRef<UploadInventoryComponent>,
    private propertyService: PropertyService,
    @Inject(MAT_DIALOG_DATA) public data: { id_property: number }
  ) {}

  ngOnInit() {
    this.getInventory();
  }

  uploadInventory(file: File) {
    const extension = file.name?.split('.').pop()?.toLowerCase();
    if (
      !extension ||
      !['pdf', 'xls', 'xlsx', 'doc', 'docx'].includes(extension)
    ) {
      Swal.fire({
        title: 'Error',
        text: 'Solo se permiten archivos PDF, Excel y Word',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    this.propertyService
      .getPropertyInventory(this.data.id_property)
      .subscribe((inventories) => {
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
            .subscribe(() => {
              this.dialogRef.close('success');
            });
        }
      });
  }
  onFilesInputChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.isUploadButtonDisabled = false;
    } else {
      this.selectedFile = null;
      this.isUploadButtonDisabled = true;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.isUploadButtonDisabled = true;
  }

  getInventory() {
    this.propertyService
      .getPropertyInventory(this.data.id_property)
      .subscribe((response) => {
        console.log(response);
        this.inventories = response;
      });
  }

  getDownloadUrl(inventory: any): string {
    const baseUrl = 'http://localhost:3000/uploads/';
    const filename = inventory.filename;
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
        this.propertyService.deleteInventory(inventory.id).subscribe(() => {
          Swal.fire('Eliminado', 'El inventario ha sido eliminado', 'success');
          this.getInventory();
        });
      }
    });
  }
}
