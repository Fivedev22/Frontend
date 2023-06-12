import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IProperty } from '../interfaces/property.interface';

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

  uploadImages(id: number, images: File[]): Observable<IProperty[]> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image, `image${index}`);
    });

    return this.http.post<IProperty[]>(
      `${this.PROPERTY_URL}images/upload/${id}`,
      formData
    );
  }

  getPropertyImages(id: number): Observable<any> {
    return this.http.get<any>(`${this.PROPERTY_URL}${id}/images`);
  }

  deleteImages(propertyId: number, imageIds: number[]): Observable<any> {
    const body = { imageIds };
    return this.http.delete<any>(`${this.PROPERTY_URL}images/${propertyId}`, {
      body,
    });
  }

  uploadInventory(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.PROPERTY_URL}inventory/upload/${id}`,
      formData
    );
  }

  getPropertyInventory(id: number): Observable<any> {
    const url = `${this.PROPERTY_URL}inventories/${id}`;
    return this.http.get<any>(url).pipe(map((response) => response.inventory));
  }

  deleteInventory(InventoryId: number): Observable<any> {
    return this.http.delete(`${this.PROPERTY_URL}inventories/${InventoryId}`);
  }

  getLastNumber(): Observable<number> {
    return this.http.get<number>(
      'http://localhost:3000/property/get-last-number/:'
    );
  }
}