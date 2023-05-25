import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILogin, ILoginResponse } from '../interfaces/login.interface';
import { Observable, tap } from 'rxjs';
import { IForgotPassword } from '../interfaces/forgot-password.interface';
import { IResetPassword } from '../interfaces/reset-password.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  AUTH_URL = 'http://localhost:3000/auth/';
  constructor(private httpClient: HttpClient) {}

  // login = (body: ILogin): Observable<ILoginResponse> => {
  //   if (!body.username || !body.password)
  //     throw new Error('Username and Password are required');
  //   return this.httpClient.post<ILoginResponse>(`${this.AUTH_URL}`, body);
  // };

  public ingresar(body: ILogin):  Observable<any> {
    return this.httpClient.post(`${this.AUTH_URL}login`, body)
  }

  logout = () => {
    localStorage.removeItem('token');
  };

  public restablecerContrasenia(body: IResetPassword): Observable<any> {
    return this.httpClient.put(`${this.AUTH_URL}password-reset`, body)
  }

  public solicitarRestablecerContrasenia(body: IForgotPassword): Observable<any> {
    return this.httpClient.post(`${this.AUTH_URL}password-reset-request`, body)
  }


  get isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
