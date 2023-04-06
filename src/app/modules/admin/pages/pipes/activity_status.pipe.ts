import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activity_status'
})
export class ActivityStatusPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.activity_status_name;
  }

}