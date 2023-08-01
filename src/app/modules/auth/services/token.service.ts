import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  public setToken(token: string) {
    localStorage.setItem('anahi.accesstoken', token);
  }

  public getToken() {
    return localStorage.getItem('anahi.accesstoken');
  }
}
