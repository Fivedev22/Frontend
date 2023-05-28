import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PropertyService } from '../../services/property-page.service';


@Component({
  selector: 'app-image-upload-dialog',
  templateUrl: './image-upload-dialog.component.html',
  styleUrls: ['./image-upload-dialog.component.css']
})

export class ImageUploadDialogComponent implements OnInit {
  images!: any[];
  noImagesMessage!: string;

   carouselConfig: any = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true
        }
      }
    ]
  };

  constructor(
    private readonly dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id_property: number },
    private readonly propertyService: PropertyService,
  ) {}

  ngOnInit() {
    this.getPropertyImages();
  }

  getPropertyImages() {
    const idProperty: number = this.data.id_property;

    this.propertyService.getPropertyImages(idProperty).subscribe(
      (response: any) => {
        this.images = response.images;
        console.log(this.images);
        if (this.images.length === 0) {
          this.noImagesMessage = 'No hay imágenes cargadas para la propiedad';
        }
      },
      (error) => {
        console.error('Error al obtener las imágenes:', error);
      }
    );
  }

  uploadImages(event: any) {
    const fileList: FileList = event.target.files;
    const images: File[] = Array.from(fileList);
    const idProperty: number = this.data.id_property;

    this.propertyService.uploadImages(idProperty, images).subscribe(
      () => {
        this.getPropertyImages();
        this.dialogRef.close('success');
      },
      (error) => {
        console.error('Error al cargar imágenes:', error);
      }
    );
  }

  getImageUrl(filename: string): string {
    return 'http://localhost:3000/uploads/' + filename;
  }

  deleteImage(imageId: number) {
    const idProperty: number = this.data.id_property;
    const imageIds: number[] = [imageId];
  
    this.propertyService.deleteImages(idProperty, imageIds).subscribe(
      () => {
        // Imagen eliminada correctamente
        this.getPropertyImages();
      },
      (error) => {
        console.error('Error al eliminar la imagen:', error);
      }
    );
  }

}
