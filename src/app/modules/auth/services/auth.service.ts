import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILogin, ILoginResponse } from '../interfaces/login.interface';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  AUTH_URL = 'http://localhost:300/api/auth';
  constructor(private httpClient: HttpClient) {}

  login = (body: ILogin): Observable<ILoginResponse> => {
    if (!body.username || !body.password)
      throw new Error('Username and Password are required');
    return this.httpClient.post<ILoginResponse>(`${this.AUTH_URL}`, body);
  };

  logout = () => {
    localStorage.removeItem('token');
  };

  get isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
