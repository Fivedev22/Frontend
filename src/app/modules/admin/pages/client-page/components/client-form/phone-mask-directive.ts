import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[phoneMask]'
})
export class PhoneMaskDirective {
  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let phoneNumber = event.target.value;
    
    if (phoneNumber.length === 0) {
      this.el.nativeElement.value = '';
      return;
    }

    let formattedNumber = '';
    const hasLeadingZero = phoneNumber.charAt(0) === '0';

    if (phoneNumber.length >= 11) {
      let areaCode = '';
      let numberPart = '';

      if (hasLeadingZero) {
        areaCode = phoneNumber.slice(1, 3);
        numberPart = phoneNumber.slice(3);
      } else {
        areaCode = phoneNumber.slice(0, 2);
        numberPart = phoneNumber.slice(2);
      }

      formattedNumber = `(0${areaCode}) ${numberPart.slice(0, 4)}-${numberPart.slice(4, 8)}`;
    } else {
      if (phoneNumber.charAt(0) !== '0' && phoneNumber.length > 1) {
        phoneNumber = `0${phoneNumber}`;
      }
      
      formattedNumber = phoneNumber;
    }

    this.el.nativeElement.value = formattedNumber;
  }
}
