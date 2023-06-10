import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReservationType } from '../interfaces/reservation_type.interface';

@Injectable({
  providedIn: 'root',
})
export class ReservationTypeService {
  RESERVATION_TYPE_URL = 'http://localhost:3000/booking-type/';
  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<IReservationType[]> {
    return this.http.get<IReservationType[]>(this.RESERVATION_TYPE_URL);
  }

  findOne(id: number): Observable<IReservationType> {
    return this.http.get<IReservationType>(
      `${this.RESERVATION_TYPE_URL}${+id}`
    );
  }
}
