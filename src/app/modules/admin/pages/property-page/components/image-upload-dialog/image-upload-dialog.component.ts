import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PropertyService } from '../../../services/property-page.service';
import Swal from 'sweetalert2';
interface ImageFile {
  file: File;
  imageUrl: string;
}

@Component({
  selector: 'app-image-upload-dialog',
  templateUrl: './image-upload-dialog.component.html',
  styleUrls: ['./image-upload-dialog.component.css'],
})
export class ImageUploadDialogComponent implements OnInit {
  images!: any[];
  noImagesMessage!: string;
  selectedImages: any[] = [];
  isUploadButtonDisabled: boolean = true;
  constructor(
    private readonly dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id_property: number },
    private readonly propertyService: PropertyService
  ) {}

  ngOnInit() {
    this.getPropertyImages();
  }

  getPropertyImages() {
    const idProperty: number = this.data.id_property;

    this.propertyService.getPropertyImages(idProperty).subscribe(
      (response: any) => {
        this.images = response.images;
        if (this.images.length === 0) {
          this.noImagesMessage = 'No hay imágenes cargadas para la propiedad';
        }
      },
      (error) => {
        console.error('Error al obtener las imágenes:', error);
      }
    );
  }
  uploadImages() {
    const idProperty: number = this.data.id_property;

    this.propertyService
      .uploadImages(idProperty, this.selectedImages)
      .subscribe(
        () => {
          this.getPropertyImages();
          this.dialogRef.close('success');
        },
        (error) => {
          console.error('Error al cargar imágenes:', error);
        }
      );
  }

  onFilesInputChange(event: any) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedImages.push(file);
      console.log(this.selectedImages);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        file.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    if (this.selectedImages.length >= 3) {
      this.isUploadButtonDisabled = false;
    } else {
      this.isUploadButtonDisabled = true;
    }
  }
  removeFile(index: number) {
    this.selectedImages.splice(index, 1);
    if (this.selectedImages.length >= 3) {
      this.isUploadButtonDisabled = false;
    } else {
      this.isUploadButtonDisabled = true;
    }
  }

  getImageUrl(filename: string): string {
    return 'http://localhost:3000/uploads/' + filename;
  }

  deleteImage(imageId: number) {
    const idProperty: number = this.data.id_property;
    const imageIds: number[] = [imageId];

    Swal.fire({
      title: '¿Desea eliminar la imagen?',
      text: 'Esta acción eliminará la imagen correspondiente a la propiedad.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propertyService.deleteImages(idProperty, imageIds).subscribe(
          () => {
            this.getPropertyImages();
          },
          (error) => {
            console.error('Error al eliminar la imagen:', error);
          }
        );
      }
    });
  }
}
