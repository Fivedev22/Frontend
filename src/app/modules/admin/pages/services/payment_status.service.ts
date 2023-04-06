import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPaymentStatus } from './interfaces/payment_status.interface';


@Injectable({
  providedIn: 'root'
})
export class PaymentStatusService {

  PAYMENT_STATUS_URL = 'http://localhost:3000/payment-status/'
  constructor(private readonly http: HttpClient) { }

  findAll(): Observable<IPaymentStatus[]> {
    return this.http.get<IPaymentStatus[]>(this.PAYMENT_STATUS_URL);
  }

  findOne(id: number): Observable<IPaymentStatus> {
    return this.http.get<IPaymentStatus>(`${this.PAYMENT_STATUS_URL}${+id}`);
  }
}