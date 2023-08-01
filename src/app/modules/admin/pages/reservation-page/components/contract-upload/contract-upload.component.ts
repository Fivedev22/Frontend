import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReservationService } from '../../../../../../services/reservation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contract-upload',
  templateUrl: './contract-upload.component.html',
  styleUrls: ['./contract-upload.component.css'],
})
export class ContractUploadComponent implements OnInit {
  contracts: any[] = [];
  selectedFile: File | null = null;
  isUploadButtonDisabled: boolean = true;
  constructor(
    private dialogRef: MatDialogRef<ContractUploadComponent>,
    private reservationService: ReservationService,
    @Inject(MAT_DIALOG_DATA) public data: { id_booking: number }
  ) {}

  ngOnInit() {
    this.getContracts();
  }

  uploadContract(file: File) {
    if (
      file.type !== 'application/pdf' &&
      file.type !== 'application/msword' &&
      file.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      file.type !== 'application/vnd.ms-excel' &&
      file.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      Swal.fire({
        title: 'Error',
        text: 'Solo se permiten archivos PDF, Word y Excel',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    this.reservationService
      .getBookingContracts(this.data.id_booking)
      .subscribe((contracts) => {
        if (contracts && contracts.length > 0) {
          Swal.fire({
            title: 'Error',
            text: 'Ya existe un contrato de alquiler para esta reserva',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        } else {
          this.reservationService
            .uploadContract(this.data.id_booking, file)
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

  getContracts() {
    this.reservationService
      .getBookingContracts(this.data.id_booking)
      .subscribe((response) => {
        this.contracts = response;
      });
  }

  getDownloadUrl(contract: any): string {
    const baseUrl = 'http://localhost:3000/uploads/';
    const filename = contract.filename;
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.deleteContract(contract.id).subscribe(() => {
          Swal.fire(
            'Eliminado',
            'El contrato de alquiler ha sido eliminado correctamente',
            'success'
          );
          this.getContracts();
        });
      }
    });
  }
}
