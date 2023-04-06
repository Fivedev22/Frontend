import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'payment_type'
})
export class PaymentTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.payment_type_name;
  }

}