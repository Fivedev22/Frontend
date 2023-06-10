import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'client'
})
export class ClientPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value === null) {
      return { firstName: "", lastName: "" };
    } else {
      return { firstName: value.name, lastName: value.last_name };
    }
  }

}