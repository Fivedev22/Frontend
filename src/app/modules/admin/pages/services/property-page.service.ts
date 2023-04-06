import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProperty } from './interfaces/property.interface';


@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  PROPERTY_URL = 'http://localhost:3000/property/'

  constructor(private readonly http: HttpClient) { }

  findAllProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(this.PROPERTY_URL);
  }

  findOneProperty(id: number): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.PROPERTY_URL}${+id}`)
  }

  createProperty(property: IProperty): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.PROPERTY_URL}create`, property);
  }

  updateProperty(id: number, property: IProperty): Observable<IProperty> {
    return this.http.patch<IProperty>(`${this.PROPERTY_URL}update/${+id}`, property);
  }

  removeProperty(id: number): Observable<IProperty> {
    return this.http.delete<IProperty>(`${this.PROPERTY_URL}remove/${+id}`);
  }

  archiveProperty(id: number, property: IProperty): Observable<IProperty> {
    return this.http.patch<IProperty>(`${this.PROPERTY_URL}archive/${+id}`, property)
  }

  unarchiveProperty(id: number, property: IProperty): Observable<IProperty> {
    return this.http.patch<IProperty>(`${this.PROPERTY_URL}unarchive/${+id}`, property)
  }

  searchByReference(reference_number: number): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.PROPERTY_URL}search/${reference_number}`)
  }

}