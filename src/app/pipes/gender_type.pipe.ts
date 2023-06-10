import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender_type'
})
export class GenderTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.gender_type_name;
  }

}