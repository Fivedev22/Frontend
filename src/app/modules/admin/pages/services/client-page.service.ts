import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IClient } from './interfaces/client.interface';


@Injectable({
  providedIn: 'root'
})
export class ClientService {

  CLIENT_URL = 'http://localhost:3000/client/'

  constructor(private readonly http: HttpClient) { }

  findAllClients(): Observable<IClient[]> {
    return this.http.get<IClient[]>(this.CLIENT_URL);
  }

  findOneClient(id: number): Observable<IClient> {
    return this.http.get<IClient>(`${this.CLIENT_URL}${+id}`)
  }

  findAllArchived(): Observable<IClient[]> {
    return this.http.get<IClient[]>(`${this.CLIENT_URL}archived`);
  }

  findOneArchived(id: number): Observable<IClient> {
    return this.http.get<IClient>(`${this.CLIENT_URL}archived/${+id}`)
  }

  createClient(client: IClient): Observable<IClient> {
    return this.http.post<IClient>(`${this.CLIENT_URL}create`, client);
  }

  updateClient(id: number, client: IClient): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}update/${+id}`, client);
  }

  removeClient(id: number): Observable<IClient> {
    return this.http.delete<IClient>(`${this.CLIENT_URL}remove/${+id}`);
  }

  archiveClient(id: number): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}archive/${+id}`, null)
  }

  unarchiveClient(id: number): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}unarchive/${+id}`, null)
  }

  searchByDocument(document_number: string): Observable<IClient> {
    return this.http.get<IClient>(`${this.CLIENT_URL}search/${document_number}`)
  }

  getClientBookings(id: number): Observable<any> {
    return this.http.get<any>(`${this.CLIENT_URL}${id}/bookings`);
  }

  getClientPayments(id: number): Observable<any> {
    return this.http.get<any>(`${this.CLIENT_URL}${id}/payments`);
  }

}