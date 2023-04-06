import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'property_type'
})
export class PropertyTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.property_type_name;
  }

}