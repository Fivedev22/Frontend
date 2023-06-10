import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booking'
})
export class BookingPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.id_booking;
  }

}