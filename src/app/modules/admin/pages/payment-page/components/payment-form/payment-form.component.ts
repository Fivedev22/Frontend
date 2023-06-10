import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { IProperty } from '../../../../../../interfaces/property.interface';
import { IClient } from '../../../../../../interfaces/client.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentService } from '../../../../../../services/payment.service';
import { ClientService } from '../../../../../../services/client-page.service';
import { PropertyService } from '../../../../../../services/property-page.service';
import { IPaymentStatus } from '../../../../../../interfaces/payment_status.interface';
import { IPaymentType } from '../../../../../../interfaces/payment_type.interface';
import { PaymentTypeService } from '../../../../../../services/payment_type.service';
import { PaymentStatusService } from '../../../../../../services/payment_status.service';
import { IReservation } from '../../../../../../interfaces/reservation.interface';
import { ReservationService } from '../../../../../../services/reservation.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css'],
})
export class PaymentFormComponent implements OnInit {
  clients!: IClient[];
  properties!: IProperty[];
  payment_statuses!: IPaymentStatus[];
  payment_types!: IPaymentType[];
  reservations!: IReservation[];
  paymentForm!: FormGroup;
  reservationId: number;

  actionTitle: string = 'Registrar Cobro';
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
  ) {
    this.reservationId = paymentData?.reservationId;
  }

  ngOnInit(): void {
    if (this.reservationId) {
      this.paymentService.getLastNumber().subscribe((number) => {
        if (number) {
          this.paymentForm.patchValue({ payment_number: number + 1 });
        } else {
          this.paymentForm.patchValue({ payment_number: 1 });
        }
      });
    }

    if (this.reservationId) {
      this.reservationService
        .findOneReservation(this.reservationId)
        .subscribe((reservation) => {
          if (reservation) {
            this.addReservationData(reservation);
          }
        });
    }

    this.paymentForm = this.initForm();
    this.findAllProperties();
    this.findAllClients();
    this.findAllReservations();
    this.findAllPaymentTypes();
    this.findAllPaymentStatuses();
    this.formBuilder.group;

    this.paymentForm.get('booking_amount')?.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });

    this.paymentForm.get('extra_expenses')?.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });

    if (this.paymentData && this.paymentData.id_payment) {
      this.addPaymentData(this.paymentData);
      this.actionTitle = 'Modificar Cobro';
      this.actionButton = 'Actualizar';
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.paymentForm.controls[controlName].hasError(errorName);
  };

  addReservationData(reservation: IReservation) {
    this.paymentForm.patchValue({
      booking: reservation.booking_number,
      client: reservation.client.id_client,
      property: reservation.property.id_property,
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      booking_starting_price: reservation.starting_price,
      booking_discount: reservation.discount,
      deposit_amount: reservation.deposit_amount,
      booking_amount: reservation.booking_amount,
      extra_expenses: 0,
      payment_status: 1,
    });
  }

  initForm(): FormGroup {
    var dateDay = new Date().toLocaleDateString();
    return this.formBuilder.group({
      payment_number: [''],
      createdAt: [dateDay],
      booking: ['', [Validators.required]],
      client: ['', [Validators.required]],
      property: ['', [Validators.required]],
      check_in_date: ['', [Validators.required]],
      check_out_date: ['', [Validators.required]],
      booking_starting_price: ['', [Validators.required]],
      booking_discount: ['', [Validators.min(0)]],
      deposit_amount: ['', [Validators.required, Validators.min(0)]],
      booking_amount: ['', [Validators.required, Validators.min(0)]],
      extra_expenses: ['', [Validators.min(0)]],
      payment_amount_subtotal: ['', [Validators.required, Validators.min(0)]],
      payment_amount_total: ['', [Validators.required, Validators.min(0)]],
      payment_type: ['', [Validators.required]],
      payment_status: ['', [Validators.required]],
    });
  }

  addPaymentData(data: any) {
    this.actionTitle = 'Modificar Cobro';
    this.actionButton = 'Actualizar';
    this.paymentForm.controls['payment_number'].setValue(data.payment_number);
    this.paymentForm.controls['booking'].setValue(data.booking.id_booking);
    this.paymentForm.controls['client'].setValue(data.client.id_client);
    this.paymentForm.controls['property'].setValue(data.property.id_property);
    this.paymentForm.controls['check_in_date'].setValue(data.check_in_date);
    this.paymentForm.controls['check_out_date'].setValue(data.check_out_date);
    this.paymentForm.controls['booking_starting_price'].setValue(
      data.booking_starting_price
    );
    this.paymentForm.controls['booking_discount'].setValue(
      data.booking_discount
    );
    this.paymentForm.controls['deposit_amount'].setValue(data.deposit_amount);
    this.paymentForm.controls['booking_amount'].setValue(data.booking_amount);
    this.paymentForm.controls['extra_expenses'].setValue(data.extra_expenses);
    this.paymentForm.controls['payment_amount_subtotal'].setValue(
      data.payment_amount_subtotal
    );
    this.paymentForm.controls['payment_amount_total'].setValue(
      data.payment_amount_total
    );
    this.paymentForm.controls['payment_type'].setValue(data.payment_type.id);
    this.paymentForm.controls['payment_status'].setValue(
      data.payment_status.id_payment_status
    );
  }

  calcularPrecioFinal() {
    const montoReserva = Number(
      this.paymentForm.controls['booking_amount'].value
    );
    const gastosExtras = this.paymentForm.controls['extra_expenses'].value ?? 0;
    const gastosExtrasNum = gastosExtras ? Number(gastosExtras) : 0;
    let precioReserva = montoReserva + gastosExtrasNum;
    if (precioReserva < 0) {
      precioReserva = 0;
    }
    this.paymentForm.patchValue({ payment_amount_subtotal: precioReserva });
    this.paymentForm.patchValue({ payment_amount_total: precioReserva });
  }

  sendPayment() {
    if (!this.paymentData || !this.paymentData.id_payment) {
      this.createPayment();
    } else {
      this.updatePayment();
    }
  }

  createPayment() {
    if (this.paymentForm.valid) {
      this.paymentService.createPayment(this.paymentForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire().then(() => {
            this.paymentForm.reset();
            this.dialogRef.close('save');
          });
        },
        error: (e) => {
          this.errorAlert.fire();
        },
      });
    }
  }

  updatePayment() {
    if (this.paymentForm.valid) {
      this.paymentService
        .updatePayment(+this.paymentData.id_payment, this.paymentForm.value)
        .subscribe({
          next: (res) => {
            this.updateAlert.fire().then(() => {
              this.paymentForm.reset();
              this.dialogRef.close('update');
            });
          },
          error: (e) => {
            this.errorAlert.fire();
          },
        });
    }
  }

  findAllClients() {
    this.clientService.findAllClients().subscribe((data) => {
      this.clients = data;
    });
  }

  findAllProperties() {
    this.propertyService.findAllProperties().subscribe((data) => {
      this.properties = data;
    });
  }

  findAllReservations() {
    this.reservationService.findAllReservations().subscribe((data) => {
      this.reservations = data;
    });
  }

  findAllPaymentTypes() {
    this.paymentTypeService.findAll().subscribe((data) => {
      this.payment_types = data;
    });
  }

  findAllPaymentStatuses() {
    this.paymentStatusService.findAll().subscribe((data) => {
      this.payment_statuses = data;
    });
  }
}
