import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { IProvince } from '../../../../../../interfaces/province.interface';
import { ProvinceService } from '../../../../../../services/province.service';
import { PropertyService } from '../../../../../../services/property-page.service';
import { IPropertyType } from '../../../../../../interfaces/property_type.interface';
import { PropertyTypeService } from '../../../../../../services/property_type-service';
import { IAvailabilityStatus } from '../../../../../../interfaces/availability_status.interface';
import { AvailabilityStatusService } from '../../../../../../services/availability_status.service';
import { IActivityStatus } from '../../../../../../interfaces/activity_status.interface';
import { ActivityStatusService } from '../../../../../../services/activity_status.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.css'],
})
export class PropertyFormComponent implements OnInit {
  provinces!: IProvince[];
  property_types!: IPropertyType[];
  availability_statuses!: IAvailabilityStatus[];
  activity_statuses!: IActivityStatus[];

  propertyForm!: FormGroup;

  booleanOptions = [
    { id: true, name: 'Si' },
    { id: false, name: 'No' },
  ];

  actionTitle: string = 'Registrar Propiedad';
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) private propertyData: any,

    private formBuilder: FormBuilder,

    private provinceService: ProvinceService,
    private propertyService: PropertyService,
    private propertyTypeService: PropertyTypeService,
    private availabilityStatusService: AvailabilityStatusService,
    private activityStatusService: ActivityStatusService,

    public dialogRef: MatDialogRef<PropertyFormComponent>
  ) {}

  ngOnInit(): void {
    if (!this.propertyData) {
      this.propertyService.getLastNumber().subscribe((number) => {
        if (number) {
          this.propertyForm.patchValue({ reference_number: number + 1 });
        } else {
          this.propertyForm.patchValue({ reference_number: 1 });
        }
      });
    }
    this.propertyForm = this.initForm();
    this.propertyForm.patchValue({
      availability_status: 1,
      activity_status: 1,
    });
    this.findAllProvinces();
    this.findAllPropertyTypes();
    this.findAllAvailabilityStatuses();
    this.findAllActivityStatuses();

    if (this.propertyData) {
      this.addPropertyData(this.propertyData);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.propertyForm.controls[controlName].hasError(errorName);
  };

  initForm(): FormGroup {
    return this.formBuilder.group({
      reference_number: [''],
      property_name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
        [this.propertyNameValidator.bind(this)],
      ],
      property_type: ['', [Validators.required]],
      square_meter: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+(.[0-9]{1,2})?$'),
        ],
      ],
      street: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]+$'),
        ],
      ],
      street_number: [
        '',
        [
          Validators.required,
          Validators.maxLength(4),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      building_floor: [
        '',
        [Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9 ]+$')],
      ],
      province: ['', [Validators.required]],
      town: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]+$'),
        ],
      ],
      district: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]+$'),
        ],
      ],
      rooms_number: [
        '',
        [
          Validators.required,
          Validators.min(0),
          ,
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      bathrooms_number: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      internet: ['', [Validators.required]],
      pool: ['', [Validators.required]],
      kitchen: ['', [Validators.required]],
      laundry_equipment: ['', [Validators.required]],
      yard: ['', [Validators.required]],
      parking: ['', [Validators.required]],
      disabled_access: ['', [Validators.required]],
      kids_beds: ['', [Validators.required]],
      availability_status: ['', [Validators.required]],
      activity_status: ['', [Validators.required]],
    });
  }
  
  propertyNameValidator: AsyncValidatorFn = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const propertyName = control.value;
    const currentPropertyName = this.propertyData ? this.propertyData.property_name : null; // Nombre de la propiedad actual que se está editando
  
    if (currentPropertyName === propertyName) {
      return of(null); // Omitir la validación si el nombre es igual al nombre actual en edición
    }
  
    return this.propertyService.findAllProperties().pipe(
      map((properties) => {
        const propertyExists = properties.some((property) => property.property_name === propertyName);
        return propertyExists ? { propertyNameExists: true } : null;
      }),
      catchError(() => of(null))
    );
  };
  

  addPropertyData(data: any) {
    this.actionTitle = 'Modificar Propiedad';
    this.actionButton = 'Actualizar';
    this.propertyForm.controls['reference_number'].setValue(
      data.reference_number
    );
    this.propertyForm.controls['property_name'].setValue(data.property_name);
    this.propertyForm.controls['property_type'].setValue(data.property_type.id);
    this.propertyForm.controls['square_meter'].setValue(data.square_meter);
    this.propertyForm.controls['street'].setValue(data.street);
    this.propertyForm.controls['street_number'].setValue(data.street_number);
    this.propertyForm.controls['building_floor'].setValue(data.building_floor);
    this.propertyForm.controls['province'].setValue(data.province.id_province);
    this.propertyForm.controls['town'].setValue(data.town);
    this.propertyForm.controls['district'].setValue(data.district);
    this.propertyForm.controls['rooms_number'].setValue(data.rooms_number);
    this.propertyForm.controls['bathrooms_number'].setValue(
      data.bathrooms_number
    );
    this.propertyForm.controls['internet'].setValue(data.internet);
    this.propertyForm.controls['pool'].setValue(data.pool);
    this.propertyForm.controls['kitchen'].setValue(data.kitchen);
    this.propertyForm.controls['laundry_equipment'].setValue(
      data.laundry_equipment
    );
    this.propertyForm.controls['yard'].setValue(data.yard);
    this.propertyForm.controls['parking'].setValue(data.parking);
    this.propertyForm.controls['disabled_access'].setValue(
      data.disabled_access
    );
    this.propertyForm.controls['kids_beds'].setValue(data.kids_beds);
    this.propertyForm.controls['availability_status'].setValue(
      data.availability_status.id
    );
    this.propertyForm.controls['activity_status'].setValue(
      data.activity_status.id
    );
  }

  sendClient() {
    if (!this.propertyData) this.createProperty();
    else this.updateProperty();
  }

  createProperty() {
    if (this.propertyForm.valid) {
      this.propertyService.createProperty(this.propertyForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire().then(() => {
            this.propertyForm.reset();
            this.dialogRef.close('save');
          });
        },
        error: (e) => {
          this.errorAlert.fire();
        },
      });
    }
  }

  updateProperty() {
    if (this.propertyForm.valid) {
      this.propertyService
        .updateProperty(+this.propertyData.id_property, this.propertyForm.value)
        .subscribe({
          next: (res) => {
            this.updateAlert.fire().then(() => {
              this.propertyForm.reset();
              this.dialogRef.close('update');
            });
          },
          error: (e) => {
            this.errorAlert.fire();
          },
        });
    }
  }

  findAllProvinces() {
    this.provinceService.findAll().subscribe((data) => {
      this.provinces = data;
    });
  }

  findAllPropertyTypes() {
    this.propertyTypeService.findAll().subscribe((data) => {
      this.property_types = data;
    });
  }

  findAllAvailabilityStatuses() {
    this.availabilityStatusService.findAll().subscribe((data) => {
      this.availability_statuses = data;
    });
  }

  findAllActivityStatuses() {
    this.activityStatusService.findAll().subscribe((data) => {
      this.activity_statuses = data;
    });
  }
}
