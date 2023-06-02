import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contract-upload',
  templateUrl: './contract-upload.component.html',
  styleUrls: ['./contract-upload.component.css']
})
export class ContractUploadComponent implements OnInit {

  contracts: any[] = [];


  constructor(
    private dialogRef: MatDialogRef<ContractUploadComponent>,
    private reservationService: ReservationService,
    @Inject(MAT_DIALOG_DATA) public data: { id_booking: number }
  ) {}

  ngOnInit() {
    this.getContracts(); // Llama al método getContracts al iniciar el componente
  }

  onFileSelected(files: FileList | null) {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      this.uploadContract(selectedFile);
    }
  }

  uploadContract(file: File) {
    this.reservationService.getBookingContracts(this.data.id_booking).subscribe(
      (contracts) => {
        if (contracts && contracts.length > 0) {
          Swal.fire({
            title: 'Error',
            text: 'Ya existe un contrato de alquiler para esta reserva',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        } else {
          this.reservationService.uploadContract(this.data.id_booking, file).subscribe(
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

  getContracts() {
    this.reservationService.getBookingContracts(this.data.id_booking).subscribe(
      (response) => {
        console.log(response)
        this.contracts = response;
      },
      (error) => {
        // Manejar el error apropiadamente
      }
    );
  }

  getDownloadUrl(contract: any): string {
    const baseUrl = 'http://localhost:3000/uploads/'; // Ruta base de la carpeta de contratos en el servidor
    const filename = contract.filename; // Nombre del archivo del contrato
    return baseUrl + filename;
  }

  deleteContract(contract: any) {
    Swal.fire({
      title: '¿Desea eliminar el contrato?',
      text: 'Esta acción eliminará el contrato correspondiente a la reserva.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar el contrato
        this.reservationService.deleteContract(contract.id).subscribe(
          () => {
            // Manejar la eliminación exitosa del contrato
            this.getContracts(); // Actualizar la lista de contratos después de eliminar uno
          },
          (error) => {
            // Manejar el error apropiadamente
          }
        );
      }
    });
  }
  
  
  
}
