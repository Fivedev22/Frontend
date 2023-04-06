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

  createClient(client: IClient): Observable<IClient> {
    return this.http.post<IClient>(`${this.CLIENT_URL}create`, client);
  }

  updateClient(id: number, client: IClient): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}update/${+id}`, client);
  }

  removeClient(id: number): Observable<IClient> {
    return this.http.delete<IClient>(`${this.CLIENT_URL}remove/${+id}`);
  }

  archiveClient(id: number, client: IClient): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}archive/${+id}`, client)
  }

  unarchiveClient(id: number, client: IClient): Observable<IClient> {
    return this.http.patch<IClient>(`${this.CLIENT_URL}unarchive/${+id}`, client)
  }

  searchByDocument(document_number: string): Observable<IClient> {
    return this.http.get<IClient>(`${this.CLIENT_URL}search/${document_number}`)
  }

}