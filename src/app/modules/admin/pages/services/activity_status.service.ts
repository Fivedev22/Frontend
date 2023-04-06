import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IActivityStatus } from './interfaces/activity_status.interface';


@Injectable({
  providedIn: 'root'
})
export class ActivityStatusService {

  ACTIVITY_STATUS_URL = 'http://localhost:3000/activity-status/'
  constructor(private readonly http: HttpClient) { }

  findAll(): Observable<IActivityStatus[]> {
    return this.http.get<IActivityStatus[]>(this.ACTIVITY_STATUS_URL);
  }

  findOne(id: number): Observable<IActivityStatus> {
    return this.http.get<IActivityStatus>(`${this.ACTIVITY_STATUS_URL}${+id}`);
  }
}