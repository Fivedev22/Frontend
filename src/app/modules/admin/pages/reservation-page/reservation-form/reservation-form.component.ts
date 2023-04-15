import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { IReservationType } from '../../services/interfaces/reservation_type.interface';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { IReservationOrigin } from '../../services/interfaces/reservation_origin.interface';
import { IClient } from '../../services/interfaces/client.interface';
import { IProperty } from '../../services/interfaces/property.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import { ClientService } from '../../services/client-page.service';
import { PropertyService } from '../../services/property-page.service';
import { ReservationTypeService } from '../../services/reservation_type.service';
import { ReservationOriginService } from '../../services/reservation_origin.service';
import { ClientFormComponent } from '../../client-page/components/client-form/client-form.component';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {

  booking_types!: IReservationType[];
  booking_origins!: IReservationOrigin[];
  clients!: IClient[];
  properties!: IProperty[];
  filteredClients: IClient[] = [];


  reservationForm!: FormGroup;
  precioReserva!: number;
  

  actionTitle: string = 'Registrar Reserva'
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;
event: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private reservationData: any,

    private formBuilder: FormBuilder,
    private readonly dialog: MatDialog,

    private reservationService: ReservationService,
    private clientService: ClientService,
    private propertyService: PropertyService,
    private reservationTypeService: ReservationTypeService,
    private reservationOriginService: ReservationOriginService,
    


    public dialogRef: MatDialogRef<ReservationFormComponent>
  ) { }

  ngOnInit(): void {
    this.reservationForm = this.initForm();
    this.findAllReservationTypes();
    this.findAllReservationOrigin();
    this.findAllProperties();
    this.findAllClients();

    if (this.reservationData) {
      this.addReservationData(this.reservationData);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.reservationForm.controls[controlName].hasError(errorName);
  }

  filterClients(searchValue:string): void {
    this.filteredClients = this.clients.filter(client =>{
      client.document_number.includes(searchValue);
    })

  }


  initForm(): FormGroup {
    return this.formBuilder.group({
      booking_number: [''],
      createdAt: [''],
      booking_type: ['', [Validators.required]],
      booking_origin: ['',[Validators.required]],
      client: ['', [Validators.required,]],
      property: ['', [Validators.required]],
      adults_number: ['', [Validators.required]],
      kids_number: ['', [Validators.required]],
      pets_number: [''],
      check_in_date: ['', [Validators.required]],
      check_out_date: ['', [Validators.required]],
      check_in_hour: ['', [Validators.required]],
      check_out_hour: ['', [Validators.required]],
      starting_price: ['', [Validators.required]],
      discount: [''],
      deposit_amount: ['', [Validators.required]],
      estimated_amount_deposit: [20000],
      booking_amount: ['', [Validators.required]],
    });
  }

  generateRandomNumber(): string {
    const randomNum = Math.floor(Math.random() * 1000).toString();
    return randomNum.padStart(3);
  }

  addReservationData(data: any) {
    this.actionTitle = 'Modificar Reserva'
    this.actionButton = 'Actualizar'
    this.reservationForm.controls['booking_number'].setValue(data.booking_number);
    this.reservationForm.controls['createdAt'].setValue(data.createdAt);
    this.reservationForm.controls['booking_type'].setValue(data.booking_type.id);
    this.reservationForm.controls['booking_origin'].setValue(data.booking_origin.id);
    this.reservationForm.controls['client'].setValue(data.client.id_client);
    this.reservationForm.controls['property'].setValue(data.property.id_property);
    this.reservationForm.controls['adults_number'].setValue(data.adults_number);
    this.reservationForm.controls['kids_number'].setValue(data.kids_number);
    this.reservationForm.controls['pets_number'].setValue(data.pets_number);
    this.reservationForm.controls['check_in_date'].setValue(data.check_in_date);
    this.reservationForm.controls['check_out_date'].setValue(data.check_out_date);
    this.reservationForm.controls['check_in_hour'].setValue(data.check_in_hour);
    this.reservationForm.controls['check_out_hour'].setValue(data.check_out_hour);
    this.reservationForm.controls['starting_price'].setValue(data.starting_price);
    this.reservationForm.controls['discount'].setValue(data.discount);
    this.reservationForm.controls['deposit_amount'].setValue(data.deposit_amount);
    this.reservationForm.controls['estimated_amount_deposit'].setValue(data.estimated_amount_deposit);
    this.reservationForm.controls['booking_amount'].setValue(data.booking_amount);
  }

  calcularPrecioReserva() {
    const montoInicial = Number(this.reservationForm.controls['starting_price'].value);
    const porcentajeDescuento = Number(this.reservationForm.controls['discount'].value);
    const descuento = montoInicial * (porcentajeDescuento / 100);
    const montoConDescuento = montoInicial - descuento;
    const montoSenia = Number(this.reservationForm.controls['deposit_amount'].value);
     this.precioReserva = montoConDescuento - montoSenia;
  }


  sendReservation() {
    if (!this.reservationData) this.createReservation();
    else this.updateReservation();
  }

  createReservation() {
    if (this.reservationForm.valid) {
      this.reservationService.createReservation(this.reservationForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire()
            .then(() => {
              this.reservationForm.reset();
              this.dialogRef.close('save');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
  }

  updateReservation() {
    if (this.reservationForm.valid) {
      this.reservationService.updateReservation(+this.reservationData.id_booking, this.reservationForm.value).subscribe({
        next: (res) => {
          this.updateAlert.fire()
            .then(() => {
              this.reservationForm.reset();
              this.dialogRef.close('update');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
  }

  findAllReservationTypes() {
    this.reservationTypeService.findAll().subscribe(data => {
      this.booking_types = data;
    });
  }

  findAllReservationOrigin() {
    this.reservationOriginService.findAll().subscribe(data => {
      this.booking_origins = data;
    });
  }

  findAllClients() {
    this.clientService.findAllClients().subscribe(data => {
      this.clients = data;
    });
  }

  findAllProperties() {
    this.propertyService.findAllProperties().subscribe(data => {
      this.properties = data;
    });
  }

  openFormCreateClient() {
    this.dialog.open(ClientFormComponent, { width: '800px', disableClose: true }).afterClosed()
      .subscribe(val => {
        if (val === 'save') {
          this.reservationService.findAllReservations();
        }
      });
  }
}
