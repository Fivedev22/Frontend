import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReservationOrigin } from '../interfaces/reservation_origin.interface';

@Injectable({
  providedIn: 'root',
})
export class ReservationOriginService {
  RESERVATION_ORIGIN_URL = 'http://localhost:3000/booking-origin/';
  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<IReservationOrigin[]> {
    return this.http.get<IReservationOrigin[]>(this.RESERVATION_ORIGIN_URL);
  }

  findOne(id: number): Observable<IReservationOrigin> {
    return this.http.get<IReservationOrigin>(
      `${this.RESERVATION_ORIGIN_URL}${+id}`
    );
  }
}
