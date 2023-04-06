import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPropertyType } from './interfaces/property_type.interface';


@Injectable({
  providedIn: 'root'
})
export class PropertyTypeService {

  PROPERTY_TYPE_URL = 'http://localhost:3000/property-type/'

  constructor(private readonly http: HttpClient) { }

  findAll(): Observable<IPropertyType[]> {
    return this.http.get<IPropertyType[]>(this.PROPERTY_TYPE_URL);
  }

  findOne(id: number): Observable<IPropertyType> {
    return this.http.get<IPropertyType>(`${this.PROPERTY_TYPE_URL}${+id}`);
  }

}