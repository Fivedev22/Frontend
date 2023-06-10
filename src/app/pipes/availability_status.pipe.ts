import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'availability_status'
})
export class AvailabilityStatusPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.availability_status_name;
  }

}