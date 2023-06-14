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

    let formattedNumber = '';
    const hasLeadingZero = phoneNumber.charAt(0) === '0';

    if (phoneNumber.length >= 10) {
      let areaCode = '';
      let numberPart = '';

      if (hasLeadingZero) {
        areaCode = phoneNumber.slice(1, 4);
        numberPart = phoneNumber.slice(4);
      } else {
        areaCode = phoneNumber.slice(0, 3);
        numberPart = phoneNumber.slice(3);
      }

      formattedNumber = `(${areaCode}) ${numberPart.slice(0, 4)}-${numberPart.slice(4, 8)}`;
    } else {
      formattedNumber = phoneNumber;
    }

    if (phoneNumber.length > 10) {
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
