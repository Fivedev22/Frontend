import { Directive, ElementRef, HostListener } from '@angular/core';
import Swal from 'sweetalert2';

@Directive({
  selector: '[phoneMask]'
})
export class PhoneMaskDirective {
  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let phoneNumber = event.target.value;

    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (formattedNumber.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Número de teléfono inválido',
        text: 'El número de teléfono no debe tener más de 10 dígitos.',
        confirmButtonText: 'OK'
      });
      formattedNumber = ''; // Limpiar el número ingresado
    }

    this.el.nativeElement.value = formattedNumber;
  }
}
