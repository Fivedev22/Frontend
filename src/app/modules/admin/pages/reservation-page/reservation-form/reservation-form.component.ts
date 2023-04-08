import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { IReservationType } from '../../services/interfaces/reservation_type.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { IReservationOrigin } from '../../services/interfaces/reservation_origin.interface';
import { IClient } from '../../services/interfaces/client.interface';
import { IProperty } from '../../services/interfaces/property.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import { ClientService } from '../../services/client-page.service';
import { PropertyService } from '../../services/property-page.service';
import { ReservationTypeService } from '../../services/reservation_type.service';
import { ReservationOriginService } from '../../services/reservation_origin.service';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {

  reservation_types!: IReservationType[];
  reservation_origins!: IReservationOrigin[];
  clients!: IClient[];
  properties!: IProperty[];


  reservationForm!: FormGroup;


  actionTitle: string = 'Registrar Reserva'
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) private reservationData: any,

    private formBuilder: FormBuilder,

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
      estimated_amount_deposit: ['', [Validators.required]],
      booking_amount: ['', [Validators.required]],
    });
  }

  addReservationData(data: any) {
    this.actionTitle = 'Modificar Reserva'
    this.actionButton = 'Actualizar'
    this.reservationForm.controls['booking_number'].setValue(data.booking_number);
    this.reservationForm.controls['createdAt'].setValue(data.createdAt)
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
      this.reservation_types = data;
    });
  }

  findAllReservationOrigin() {
    this.reservationOriginService.findAll().subscribe(data => {
      this.reservation_origins = data;
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

}
