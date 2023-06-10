import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservation_type'
})
export class ReservationTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.booking_type_name;
  }

}