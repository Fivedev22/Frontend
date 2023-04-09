import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReservation } from './interfaces/reservation.interface';


@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  RESERVATION_URL = 'http://localhost:3000/booking/'

  constructor(private readonly http: HttpClient) { }

  findAllReservations(): Observable<IReservation[]> {
    return this.http.get<IReservation[]>(this.RESERVATION_URL);
  }

  findOneReservation(id: number): Observable<IReservation> {
    return this.http.get<IReservation>(`${this.RESERVATION_URL}${+id}`)
  }

  createReservation(reservation: IReservation): Observable<IReservation> {
    return this.http.post<IReservation>(`${this.RESERVATION_URL}create`, reservation);
  }

  updateReservation(id: number, reservation: IReservation): Observable<IReservation> {
    return this.http.patch<IReservation>(`${this.RESERVATION_URL}edit/${+id}`, reservation);
  }

  removeReservation(id: number): Observable<IReservation> {
    return this.http.delete<IReservation>(`${this.RESERVATION_URL}remove/${+id}`);
  }

  archiveReservation(id: number, reservation: IReservation): Observable<IReservation> {
    return this.http.patch<IReservation>(`${this.RESERVATION_URL}archive/${+id}`, reservation)
  }

  unarchiveReservation(id: number, reservation: IReservation): Observable<IReservation> {
    return this.http.patch<IReservation>(`${this.RESERVATION_URL}unarchive/${+id}`, reservation)
  }

  searchByNumber(reservation_number: number): Observable<IReservation> {
    return this.http.get<IReservation>(`${this.RESERVATION_URL}search/${reservation_number}`)
  }

}