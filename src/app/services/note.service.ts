import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.inteface';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private baseUrl = 'http://localhost:3000/notes'; 

  constructor(private http: HttpClient) {}

  findAll(): Observable<Note[]> {
    return this.http.get<Note[]>(this.baseUrl);
  }

  findOne(id: number): Observable<Note> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Note>(url);
  }

  create(note: Note): Observable<Note> {
    const url = `${this.baseUrl}/create-note`;
    return this.http.post<Note>(url, note);
  }

  update(id: number, note: Note): Observable<Note> {
    const url = `${this.baseUrl}/edit/${id}`;
    return this.http.put<Note>(url, note);
  }

  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
