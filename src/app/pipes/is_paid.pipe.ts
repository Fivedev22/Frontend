import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'is_paid'
})
export class IsPaidPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === true ? "Pagada" : "Pendiente";
  }
}