import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAvailabilityStatus } from './interfaces/availability_status.interface';


@Injectable({
  providedIn: 'root'
})
export class AvailabilityStatusService {

  AVAILABILITY_STATUS_URL = 'http://localhost:3000/availability-status/'
  constructor(private readonly http: HttpClient) { }

  findAll(): Observable<IAvailabilityStatus[]> {
    return this.http.get<IAvailabilityStatus[]>(this.AVAILABILITY_STATUS_URL);
  }

  findOne(id: number): Observable<IAvailabilityStatus> {
    return this.http.get<IAvailabilityStatus>(`${this.AVAILABILITY_STATUS_URL}${+id}`);
  }
}