import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ProvinceService } from '../../../../../../services/province.service';
import { GenderTypeService } from '../../../../../../services/gender_type.service';
import { IProvince } from '../../../../../../interfaces/province.interface';
import { IGenderType } from '../../../../../../interfaces/gender_type.interface';
import { ClientService } from '../../../../../../services/client-page.service';
import { IDocumentType } from '../../../../../../interfaces/document_type.interface';
import { DocumentTypeService } from '../../../../../../services/document_type.service';
import { map, Observable, of } from 'rxjs';
import { IClient } from 'src/app/interfaces/client.interface';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css'],
})
export class ClientFormComponent implements OnInit {
  provinces!: IProvince[];
  genderTypes!: IGenderType[];
  documentTypes!: IDocumentType[];

  clientForm!: FormGroup;

  foreignOptions = [
    { id: true, name: 'Si' },
    { id: false, name: 'No' },
  ];

  actionTitle: string = 'Registrar Cliente';
  actionButton: string = 'Registrar';

  @ViewChild('createAlert') createAlert!: SwalComponent;
  @ViewChild('updateAlert') updateAlert!: SwalComponent;
  @ViewChild('errorAlert') errorAlert!: SwalComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) private clientData: any,

    private formBuilder: FormBuilder,

    private provinceService: ProvinceService,
    private documentTypeService: DocumentTypeService,
    private genderTypeService: GenderTypeService,
    private clientService: ClientService,

    public dialogRef: MatDialogRef<ClientFormComponent>
  ) {}

  ngOnInit(): void {
    this.clientForm = this.initForm();
    this.findAllProvinces();
    this.findAllDocumentTypes();
    this.findAllGenderTypes();

    if (this.clientData) {
      this.addClientData(this.clientData);
    }
  }

  changeStateProvince() {
    if (this.clientForm.controls['is_foreign'].value) {
      this.clientForm.controls['province'].disable();
      this.clientForm.controls['province'].reset();
    } else {
      this.clientForm.controls['province'].enable();
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.clientForm.controls[controlName].hasError(errorName);
  };

  initForm(): FormGroup {
    return this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          this.noNumbersValidator,
        ],
      ],
      last_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          this.noNumbersValidator,
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Validators.email,
        ],
        this.validateEmailUnique(this.clientService, this.clientData?.id_client) 
      ],
      phone_number: [
        '',
        [
          Validators.required,
          Validators.pattern('[0-9]*'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
        this.phoneNumberValidator(this.clientService, this.clientData?.id_client)
      ],
      gender_type: ['', [Validators.required]],
      document_type: ['', [Validators.required]],
      document_number: [
        '',
        [
          Validators.required,
          Validators.pattern('[A-Z0-9]*'),
          Validators.minLength(8),
          Validators.maxLength(11),
        ],
        this.documentNumberValidator(this.clientService, this.clientData?.id_client)
      ],
      is_foreign: ['', [Validators.required]],
      province: ['', [Validators.required]],
    });
  }

  documentNumberValidator(clientService: ClientService, clientId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const documentNumber = control.value;
  
        return clientService.searchByDocument(documentNumber).pipe(
          map((client: IClient) => {
            // Si el cliente existe y su ID no coincide con el cliente en edición, mostrar error
            if (client && client.id_client !== clientId) {
              return { documentExists: true };
            }
            return null;
          })
        );
    };
  }
  

  validateEmailUnique(clientService: ClientService, clientId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return clientService.findAllClients().pipe(
        map((clients: IClient[]) => {
          const email = control.value.toLowerCase();
          // Si clientId está definido, filtrar los clientes para ignorar el cliente en edición
          const filteredClients = clientId ? clients.filter((client) => client.id_client !== clientId) : clients;
          const emailExists = filteredClients.some((client) => client.email.toLowerCase() === email);
          return emailExists ? { emailTaken: true } : null;
        })
      );
    };
  }
  

  phoneNumberValidator(clientService: ClientService, clientId?: number) {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      const phoneNumber = control.value;
  
      if (!phoneNumber || phoneNumber === '') {
        // No hagas validación si el campo está vacío
        return null;
      }
  
      try {
        // Obtener todos los clientes
        const clients = await clientService.findAllClients().toPromise();
  
        // Si clientId está definido, filtrar los clientes para ignorar el cliente en edición
        const filteredClients = clientId ? clients?.filter((client) => client.id_client !== clientId) : clients;
  
        // Verificar si algún cliente tiene el mismo número de teléfono
        const duplicateClient = filteredClients?.find((client) => client.phone_number === phoneNumber);
  
        if (duplicateClient) {
          // Encontró un cliente con el mismo número de teléfono
          return { phoneNumberDuplicate: true };
        }
  
        // No se encontraron clientes con el mismo número de teléfono
        return null;
      } catch (error) {
        // Manejo de errores en caso de que ocurra algún problema con el servicio
        console.error('Error al buscar clientes:', error);
        return null;
      }
    };
  }
  
  

  addClientData(data: any) {
    this.actionTitle = 'Modificar Cliente';
    this.actionButton = 'Actualizar';
    this.clientForm.controls['name'].setValue(data.name);
    this.clientForm.controls['last_name'].setValue(data.last_name);
    this.clientForm.controls['email'].setValue(data.email);
    this.clientForm.controls['phone_number'].setValue(data.phone_number);
    this.clientForm.controls['gender_type'].setValue(
      data.gender_type.id_gender_type
    );
    this.clientForm.controls['document_type'].setValue(
      data.document_type.id_document_type
    );
    this.clientForm.controls['document_number'].setValue(data.document_number);
    this.clientForm.controls['is_foreign'].setValue(data.is_foreign);
    data.is_foreign
      ? this.clientForm.controls['province'].setValue(null)
      : this.clientForm.controls['province'].setValue(
          data.province.id_province
        );
    this.changeStateProvince();
  }

  sendClient() {
    if (!this.clientData) this.createClient();
    else this.updateClient();
  }

  createClient() {
    if (this.clientForm.valid) {
      this.clientService.createClient(this.clientForm.value).subscribe({
        next: (res) => {
          this.createAlert.fire().then(() => {
            this.clientForm.reset();
            this.dialogRef.close('save');
          });
        },
        error: (e) => {
          this.errorAlert.fire();
        },
      });
    }
  }

  updateClient() {
    if (this.clientForm.valid) {
      this.clientService
        .updateClient(+this.clientData.id_client, this.clientForm.value)
        .subscribe({
          next: (res) => {
            this.updateAlert.fire().then(() => {
              this.clientForm.reset();
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

  findAllGenderTypes() {
    this.genderTypeService.findAll().subscribe((data) => {
      this.genderTypes = data;
    });
  }

  findAllDocumentTypes() {
    this.documentTypeService.findAll().subscribe((data) => {
      this.documentTypes = data;
    });
  }

  noNumbersValidator(control: AbstractControl): { [key: string]: any } | null {
    const name = control.value;
    const regex = /^[A-Za-z\s]+$/;
    if (name && !regex.test(name)) {
      return { noNumbers: true };
    }
    return null;
  }
}
