import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'client'
})
export class ClientPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.name;
  }

}