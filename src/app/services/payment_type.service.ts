import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPaymentType } from '../interfaces/payment_type.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentTypeService {
  PAYMENT_TYPE_URL = 'http://localhost:3000/payment-type/';
  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<IPaymentType[]> {
    return this.http.get<IPaymentType[]>(this.PAYMENT_TYPE_URL);
  }

  findOne(id: number): Observable<IPaymentType> {
    return this.http.get<IPaymentType>(`${this.PAYMENT_TYPE_URL}${+id}`);
  }
}
