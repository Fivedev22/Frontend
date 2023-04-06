import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'document_type'
})
export class DocumentTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value === null ? "" : value.document_type_name;
  }

}