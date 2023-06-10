import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'payment_status'
})
export class PaymentStatusPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.payment_status_name;
  }

}