import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPayment } from './interfaces/payment.interface';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  PAYMENT_URL = 'http://localhost:3000/payment/'

  constructor(private readonly http: HttpClient) { }

  findAllPayments(): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(this.PAYMENT_URL);
  }

  findOnePayment(id: number): Observable<IPayment> {
    return this.http.get<IPayment>(`${this.PAYMENT_URL}${+id}`)
  }

  createPayment(payment: IPayment): Observable<IPayment> {
    return this.http.post<IPayment>(`${this.PAYMENT_URL}create`, payment);
  }

  updatePayment(id: number, payment: IPayment): Observable<IPayment> {
    return this.http.patch<IPayment>(`${this.PAYMENT_URL}update/${+id}`, payment);
  }

  removePayment(id: number): Observable<IPayment> {
    return this.http.delete<IPayment>(`${this.PAYMENT_URL}remove/${+id}`);
  }

  archivePayment(id: number, payment: IPayment): Observable<IPayment> {
    return this.http.patch<IPayment>(`${this.PAYMENT_URL}archive/${+id}`, payment)
  }

  unarchivePayment(id: number, payment: IPayment): Observable<IPayment> {
    return this.http.patch<IPayment>(`${this.PAYMENT_URL}unarchive/${+id}`, payment)
  }

  searchByNumber(payment_number: number): Observable<IPayment> {
    return this.http.get<IPayment>(`${this.PAYMENT_URL}search/${payment_number}`)
  }

}