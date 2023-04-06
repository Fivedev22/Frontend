import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { IProvince } from '../../services/interfaces/province.interface';
import { ProvinceService } from '../../services/province.service';
import { PropertyService } from '../../services/property-page.service';
import { IPropertyType } from '../../services/interfaces/property_type.interface';
import { PropertyTypeService } from '../../services/property_type-service';
import { IAvailabilityStatus } from '../../services/interfaces/availability_status.interface';
import { AvailabilityStatusService } from '../../services/availability_status.service';
import { IActivityStatus } from '../../services/interfaces/activity_status.interface';
import { ActivityStatusService } from '../../services/activity_status.service';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.css']
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
  ]


  actionTitle: string = 'Registrar Propiedad'
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
  ) { }

  ngOnInit(): void {
    this.propertyForm = this.initForm();
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
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      reference_number: ['', [Validators.required,]],
      property_name: ['', [Validators.required]],
      property_type: ['', [Validators.required]],
      square_meter: [''],
      street: ['', [Validators.required,]],
      street_number: ['', [Validators.required]],
      building_floor: [''],
      province: ['', [Validators.required]],
      town: ['', [Validators.required]],
      district: ['', [Validators.required]],
      daily_rent: ['', [Validators.required]],
      monthly_rent: ['', [Validators.required]],
      annual_rent: ['', [Validators.required]],
      rooms_number: ['', [Validators.required]],
      bathrooms_number: ['', [Validators.required]],
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

  addPropertyData(data: any) {
    this.actionTitle = 'Modificar Propiedad'
    this.actionButton = 'Actualizar'
    this.propertyForm.controls['reference_number'].setValue(data.reference_number);
    this.propertyForm.controls['property_name'].setValue(data.property_name);
    this.propertyForm.controls['property_type'].setValue(data.property_type.id);
    this.propertyForm.controls['square_meter'].setValue(data.square_meter);
    this.propertyForm.controls['street'].setValue(data.gender_type.street);
    this.propertyForm.controls['street_number'].setValue(data.street_number);
    this.propertyForm.controls['building_floor'].setValue(data.building_floor);
    this.propertyForm.controls['province'].setValue(data.province.id_province);
    this.propertyForm.controls['town'].setValue(data.town);
    this.propertyForm.controls['district'].setValue(data.district);
    this.propertyForm.controls['daily_rent'].setValue(data.daily_rent);
    this.propertyForm.controls['monthly_rent'].setValue(data.monthly_rent);
    this.propertyForm.controls['annual_rent'].setValue(data.annual_rent);
    this.propertyForm.controls['rooms_number'].setValue(data.rooms_number);
    this.propertyForm.controls['bathrooms_number'].setValue(data.bathrooms_number);
    this.propertyForm.controls['internet'].setValue(data.internet);
    this.propertyForm.controls['pool'].setValue(data.pool);
    this.propertyForm.controls['kitchen'].setValue(data.kitchen);
    this.propertyForm.controls['laundry_equipment'].setValue(data.laundry_equipment);
    this.propertyForm.controls['yard'].setValue(data.yard);
    this.propertyForm.controls['parking'].setValue(data.parking);
    this.propertyForm.controls['disabled_access'].setValue(data.disabled_access);
    this.propertyForm.controls['kids_beds'].setValue(data.kids_beds);
    this.propertyForm.controls['availability_status'].setValue(data.availability_status.id);
    this.propertyForm.controls['activity_status'].setValue(data.activity_status.id);
  }

  sendClient() {
    if (!this.propertyData) this.createProperty();
    else this.updateProperty();
  }

  createProperty() {
    if (this.propertyForm.valid) {
      this.propertyService.createProperty(this.propertyForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire()
            .then(() => {
              this.propertyForm.reset();
              this.dialogRef.close('save');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
  }

  updateProperty() {
    if (this.propertyForm.valid) {
      this.propertyService.updateProperty(+this.propertyData.id_client, this.propertyForm.value).subscribe({
        next: (res) => {
          this.updateAlert.fire()
            .then(() => {
              this.propertyForm.reset();
              this.dialogRef.close('update');
            });
        },
        error: (e) => {
          this.errorAlert.fire();
        }
      })
    }
  }

  findAllProvinces() {
    this.provinceService.findAll().subscribe(data => {
      this.provinces = data;
    });
  }

  
  findAllPropertyTypes() {
    this.propertyTypeService.findAll().subscribe(data => {
      this.property_types = data;
    });
  }

  findAllAvailabilityStatuses() {
    this.availabilityStatusService.findAll().subscribe(data => {
      this.availability_statuses = data;
    });
  }

  findAllActivityStatuses() {
    this.activityStatusService.findAll().subscribe(data => {
      this.activity_statuses = data;
    });
  }

}
