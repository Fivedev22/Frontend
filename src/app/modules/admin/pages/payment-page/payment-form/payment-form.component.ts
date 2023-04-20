import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { IProperty } from '../../services/interfaces/property.interface';
import { IClient } from '../../services/interfaces/client.interface';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentService } from '../../services/payment.service';
import { ClientService } from '../../services/client-page.service';
import { PropertyService } from '../../services/property-page.service';
import { IPaymentStatus } from '../../services/interfaces/payment_status.interface';
import { IPaymentType } from '../../services/interfaces/payment_type.interface';
import { PaymentTypeService } from '../../services/payment_type.service';
import { PaymentStatusService } from '../../services/payment_status.service';
import { IReservation } from '../../services/interfaces/reservation.interface';
import { ReservationService } from '../../services/reservation.service';
import { Observable, map } from 'rxjs';
import { IPayment } from '../../services/interfaces/payment.interface';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit {

  clients!: IClient[];
  properties!: IProperty[];
  payment_statuses!: IPaymentStatus[];
  payment_types!: IPaymentType[];
  reservations!: IReservation[];
  paymentForm!: FormGroup;


  actionTitle: string = 'Registrar Cobro'
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) private paymentData: any,

    private formBuilder: FormBuilder,

    private paymentService: PaymentService,
    private clientService: ClientService,
    private propertyService: PropertyService,
    private reservationService: ReservationService,
    private paymentTypeService: PaymentTypeService,
    private paymentStatusService: PaymentStatusService,


    public dialogRef: MatDialogRef<PaymentFormComponent>
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.initForm();
    this.findAllProperties();
    this.findAllClients();
    this.findAllReservations();
    this.findAllPaymentTypes();
    this.findAllPaymentStatuses();

    if (this.paymentData) {
      this.addPaymentData(this.paymentData);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.paymentForm.controls[controlName].hasError(errorName);
  }

  initForm(): FormGroup {
    var dateDay = new Date().toLocaleDateString();
    return this.formBuilder.group({
      payment_number: [this.generateRandomNumber(), [Validators.required], this.validatePaymentNumber.bind(this)],
      createdAt: [dateDay],
      booking: ['', [Validators.required]],
      client: ['', [Validators.required]],
      property: ['', [Validators.required]],
      check_in_date: ['', [Validators.required]],
      check_out_date: ['', [Validators.required]],
      booking_amount: ['', [Validators.required, Validators.min(10000)]],
      booking_discount: ['', [Validators.min(0)]],
      deposit_amount: ['', [Validators.required, Validators.min(10000)]],
      payment_amount_subtotal: ['', [Validators.required, Validators.min(0)]],
      payment_amount_total: ['', [Validators.required, Validators.min(0)]],
      payment_type: ['', [Validators.required]],
      payment_status: ['', [Validators.required]],
    });
  }
  
  validatePaymentNumber(control: AbstractControl): Observable<ValidationErrors | null> {
    const paymentNumber = control.value;
    return this.paymentService.searchByNumber(paymentNumber).pipe(
      map((payment: IPayment) => {
        return payment ? { paymentNumberTaken: true } : null;
      })
    );
  }
  

  generateRandomNumber(): string {
    const randomNum = Math.floor(Math.random() * 1000).toString();
    return randomNum.padStart(4, '1');
  }

  addPaymentData(data: any) {
    this.actionTitle = 'Modificar Cobro'
    this.actionButton = 'Actualizar'
    this.paymentForm.controls['payment_number'].setValue(data.payment_number);
    this.paymentForm.controls['booking'].setValue(data.booking.id_booking);
    this.paymentForm.controls['client'].setValue(data.client.id_client);
    this.paymentForm.controls['property'].setValue(data.property.id_property);
    this.paymentForm.controls['check_in_date'].setValue(data.check_in_date);
    this.paymentForm.controls['check_out_date'].setValue(data.check_out_date);
    this.paymentForm.controls['booking_amount'].setValue(data.booking_amount);
    this.paymentForm.controls['booking_discount'].setValue(data.booking_discount);
    this.paymentForm.controls['deposit_amount'].setValue(data.deposit_amount);
    this.paymentForm.controls['payment_amount_subtotal'].setValue(data.payment_amount_subtotal);
    this.paymentForm.controls['payment_amount_total'].setValue(data.payment_amount_total);
    this.paymentForm.controls['payment_type'].setValue(data.payment_type.id);
    this.paymentForm.controls['payment_status'].setValue(data.payment_status.id_payment_status);
  }

  sendPayment() {
    if (!this.paymentData) this.createPayment();
    else this.updatePayment();
  }

  createPayment() {
    if (this.paymentForm.valid) {
      this.paymentService.createPayment(this.paymentForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire()
            .then(() => {
              this.paymentForm.reset();
              this.dialogRef.close('save');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
  }

  updatePayment() {
    if (this.paymentForm.valid) {
      this.paymentService.updatePayment(+this.paymentData.id_payment, this.paymentForm.value).subscribe({
        next: (res) => {
          this.updateAlert.fire()
            .then(() => {
              this.paymentForm.reset();
              this.dialogRef.close('update');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
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

  findAllReservations() {
    this.reservationService.findAllReservations().subscribe(data => {
      this.reservations = data;
    });
  }

  findAllPaymentTypes() {
    this.paymentTypeService.findAll().subscribe(data => {
      this.payment_types = data;
    });
  }

  findAllPaymentStatuses() {
    this.paymentStatusService.findAll().subscribe(data => {
      this.payment_statuses = data;
    });
  }
}
