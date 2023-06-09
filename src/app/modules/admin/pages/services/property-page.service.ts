import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProperty } from './interfaces/property.interface';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  PROPERTY_URL = 'http://localhost:3000/property/';

  constructor(private readonly http: HttpClient) {}

  findAllProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(this.PROPERTY_URL);
  }

  findAllArchived(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.PROPERTY_URL}archived`);
  }

  findOneProperty(id: number): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.PROPERTY_URL}${+id}`);
  }

  findOneArchived(id: number): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.PROPERTY_URL}archived/${+id}`);
  }

  createProperty(property: IProperty): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.PROPERTY_URL}create`, property);
  }

  updateProperty(id: number, property: IProperty): Observable<IProperty> {
    return this.http.patch<IProperty>(
      `${this.PROPERTY_URL}update/${+id}`,
      property
    );
  }

  removeProperty(id: number): Observable<IProperty> {
    return this.http.delete<IProperty>(`${this.PROPERTY_URL}remove/${+id}`);
  }

  archiveProperty(id: number): Observable<IProperty> {
    return this.http.patch<IProperty>(
      `${this.PROPERTY_URL}archive/${+id}`,
      null
    );
  }

  unarchiveProperty(id: number): Observable<IProperty> {
    return this.http.patch<IProperty>(
      `${this.PROPERTY_URL}unarchive/${+id}`,
      null
    );
  }

  searchByReference(reference_number: number): Observable<IProperty> {
    return this.http.get<IProperty>(
      `${this.PROPERTY_URL}search/${reference_number}`
    );
  }
}
