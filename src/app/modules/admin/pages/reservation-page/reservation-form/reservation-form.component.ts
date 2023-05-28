import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';



@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReservationFormComponent implements OnInit {

  booking_types!: IReservationType[];
  booking_origins!: IReservationOrigin[];
  clients!: IClient[];
  properties!: IProperty[];
  reservationForm!: FormGroup;
  occupiedDates$!: Observable<Date[]>;
  id_property!: number;
  occupiedDates: Date[]=[];
  propertyControl = new FormControl();
  filteredProperties: IProperty[] = [];
  searchControl = new FormControl();
  filteredClients: IClient[]=[];
  showNotFoundMessage1: any;
  showNotFoundMessage2: any;
  propertyDetail = new FormControl();
  clientDetail = new FormControl();

  


  actionTitle: string = 'Registrar Reserva'
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;
  


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
  ) {
    this.propertyControl.valueChanges.subscribe((value) => {
      this.filteredProperties = this.filterProperties(value);
      console.log(value);
    });

     this.searchControl.valueChanges.subscribe((value) => {
      this.filteredClients = this.filterClients(value);
      console.log(value);
    });
  }
  
  minDate = new Date(2023, 0, 1);
  maxDate = new Date(2100,0,1);
  

  ngOnInit(): void {
    if (!this.reservationData) {
      this.reservationService.getLastNumber().subscribe(number => {
        if (number) {
            this.reservationForm.patchValue({booking_number: number + 1});
          } else {
            this.reservationForm.patchValue({booking_number: 1});
          }      
        });
    }

    this.reservationForm = this.initForm();
    this.reservationForm.controls['discount'].setValue(0); // Inicializar el campo 'discount' en cero
    this.reservationForm.controls['booking_amount'].setValue(0);
    this.findAllReservationTypes();
    this.findAllReservationOrigin();
    this.findAllProperties();
    this.findAllClients();
    this.getBookingsOcuped();
    this.formBuilder.group

    this.reservationForm.get('starting_price')?.valueChanges.subscribe(() => {
      this.calcularPrecioReserva();
    });
  
    this.reservationForm.get('discount')?.valueChanges.subscribe(() => {
      this.calcularPrecioReserva();
    });
  
    this.reservationForm.get('deposit_amount')?.valueChanges.subscribe(() => {
      this.calcularPrecioReserva();
    });

    if (this.reservationData) {
      this.addReservationData(this.reservationData);
    }


    if (this.reservationData) {
  const checkInDate = new Date(this.reservationData.check_in_date);
  const checkOutDate = new Date(this.reservationData.check_out_date);

  // Verificar si los controles han sido modificados
  const checkInControl = this.reservationForm.controls['check_in_date'];
  const checkOutControl = this.reservationForm.controls['check_out_date'];
  const checkInValue = checkInControl.value;
  const checkOutValue = checkOutControl.value;
  const datesModified = checkInControl.dirty || checkOutControl.dirty;

  // Asignar las fechas ajustadas o no ajustadas a los controles del formulario
  if (!datesModified) {
    // Ajustar las fechas según la zona horaria local
    checkInDate.setUTCDate(checkInDate.getUTCDate() + 1);
    checkOutDate.setUTCDate(checkOutDate.getUTCDate() + 1);

    checkInControl.setValue(checkInDate);
    checkOutControl.setValue(checkOutDate);
  } else {
    // Las fechas han sido modificadas, asignar los valores actuales sin ajuste
    checkInControl.setValue(checkInValue);
    checkOutControl.setValue(checkOutValue);
  }
}
}


  filterProperties(value: string): IProperty[] {
    const filterValue = value.toString().toLowerCase();
  
    if (Array.isArray(this.properties)) {
      return this.properties.filter(
        (property) =>
          property.property_name.toString().toLowerCase().indexOf(filterValue) === 0
      );
    } else {
      // Manejar el caso en el que this.properties no sea un arreglo
      return [];
    }
  }
  

  filterClients(value: string): IClient[] {
    const filterValue = value.toString().toLowerCase();
  
    if (Array.isArray(this.clients)) {
      return this.clients.filter(
        (client) =>
          client.document_number.toString().toLowerCase().indexOf(filterValue) !== -1
      );
    } else {
      // Manejar el caso en el que this.clients no sea un arreglo
      return [];
    }
  }
  

  onPropertySelected(event: MatAutocompleteSelectedEvent): void {
    const property = event.option.value;
    this.reservationForm.controls['property'].setValue(property.id_property);
    this.propertyControl.setValue(property.property_name); // Asignar el valor del nombre al campo de entrada
    this.propertyDetail.setValue(property.property_name);
    this.propertyControl.setValue('');
  }

  onClientSelected(event: MatAutocompleteSelectedEvent): void {
    const client = event.option.value;
    this.reservationForm.controls['client'].setValue(client.id_client);
    this.searchControl.setValue(client.name + ' ' + client.last_name); // Asignar el valor del nombre al campo de entrada 
    this.clientDetail.setValue(client.name + ' ' + client.last_name); 
    this.searchControl.setValue(''); 
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.reservationForm.controls[controlName].hasError(errorName);  
  }

  onInputChanged() {
    const value = this.propertyControl.value;
  
    // Comprueba si el valor ingresado está en la lista de opciones
    const optionExists = this.filteredProperties.some((property) => {
      return property.property_name.toLowerCase().includes(value.toLowerCase());
    });
  
    // Si el valor ingresado no está en la lista de opciones, muestra el mensaje "propiedad no encontrada"
    this.showNotFoundMessage1 = value && !optionExists;
  }

  onInputChangedClient() {
    const value = this.searchControl.value;
  
    // Comprueba si el valor ingresado está en la lista de opciones
    const optionExists = this.filteredClients.some((client) => {
      return client.document_number.toLowerCase().includes(value.toLowerCase());
    });
  
    // Si el valor ingresado no está en la lista de opciones, muestra el mensaje "cliente no encontrado"
    this.showNotFoundMessage2 = value && !optionExists;
  }
  
  

  initForm(): FormGroup {
    const dateDay = new Date().toLocaleDateString();
    return this.formBuilder.group({
      booking_number: [''],
      createdAt: [dateDay],
      booking_type: ['', [Validators.required]],
      booking_origin: ['', [Validators.required]],
      client: ['', [Validators.required]],
      property: ['',[Validators.required]],
      adults_number: ['', [Validators.required, Validators.min(1),Validators.pattern('^[0-9]+$')]],
      kids_number: ['', [Validators.required, Validators.min(0),Validators.pattern('^[0-9]+$')]],
      pets_number: ['', [Validators.min(0),Validators.pattern('^[0-9]+$')]],
      check_in_date: ['', [Validators.required]],
      check_out_date: ['', [Validators.required]],
      check_in_hour: ['', [Validators.required]],
      check_out_hour: ['', [Validators.required]],
      starting_price: ['', [Validators.required, Validators.min(10000)]],
      discount: ['', Validators.min(0)],
      deposit_amount: ['', [Validators.required, Validators.min(10000)]],
      estimated_amount_deposit: [10000],
      booking_amount: ['',[Validators.required, Validators.min(0)]],  
    },{ validator: this.checkInCheckOutValidator });
  }

  checkInCheckOutValidator(reservationForm: FormGroup) {
    const checkInDate = reservationForm.get('check_in_date')?.value;
    const checkOutDate = reservationForm.get('check_out_date')?.value;
  
    if (checkInDate && checkOutDate && checkInDate > checkOutDate) {
      reservationForm.get('check_out_date')?.setErrors({ 'checkOutBeforeCheckIn': true });
    } else {
      reservationForm.get('check_out_date')?.setErrors(null);
    }
  }

  getBookingsOcuped() {
    if (!this.reservationData) {
      this.reservationForm.controls['property'].valueChanges.subscribe(propertyId => {
        if (propertyId) {
          this.reservationService.getOccupiedDatesForProperty(propertyId).subscribe(occupiedDates => {
            console.log('Fechas ocupadas:', occupiedDates);
            this.occupiedDates = occupiedDates;
            console.log('Fechas ocupadas:', this.occupiedDates);
          });
        } 
      }); 
    }
  }


  dateClass = (date: Date): string => {
    return this.dateFilter(date) ? 'disabled-date' : '';
  }
  
  
  dateFilter = (date: Date | null) => {
    if (!date) {
      return true; // permitir fechas vacías
    }
    
  
    const dateStr = date.toISOString().slice(0, 10);
    const occupiedDatesHash: { [key: string]: boolean } = {};
    this.occupiedDates.forEach((date) => {
      const dateObj = new Date(date);
      const dateStr = dateObj.toISOString().slice(0, 10);
      occupiedDatesHash[dateStr] = true;
    });
  
    return !occupiedDatesHash[dateStr];
  }

  
  addReservationData(data: any) {
    this.actionTitle = 'Modificar Reserva'
    this.actionButton = 'Actualizar'
    this.reservationForm.controls['booking_number'].setValue(data.booking_number);
    this.reservationForm.controls['createdAt'].setValue(data.createdAt);
    this.reservationForm.controls['booking_type'].setValue(data.booking_type.id);
    this.reservationForm.controls['booking_origin'].setValue(data.booking_origin.id);
    const selectedClient = {
      name: data.client.name,
      last_name: data.client.last_name,
      id_client: data.client.id_client
    };
    this.clientDetail.setValue(selectedClient.name + ' ' + selectedClient.last_name)
    this.reservationForm.controls['client'].setValue(selectedClient.id_client);
    const selectedProperty = {
      property_name: data.property.property_name,
      id_property: data.property.id_property
    };
    this.propertyDetail.setValue(selectedProperty.property_name);
    this.reservationForm.controls['property'].setValue(selectedProperty.id_property);  
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
    let precioReserva = montoConDescuento - montoSenia;
    if (precioReserva < 0) {
        precioReserva = 0;
    }
    this.reservationForm.patchValue({ booking_amount: precioReserva });
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
