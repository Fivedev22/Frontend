import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservation_origin'
})
export class ReservationOriginPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.origin_name;
  }

}