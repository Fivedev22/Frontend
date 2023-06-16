import { Component, OnInit } from '@angular/core';
import { Note } from 'src/app/interfaces/note.inteface';
import { NoteService } from 'src/app/services/note.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-note-page',
  templateUrl: './note-page.component.html',
  styleUrls: ['./note-page.component.css']
})
export class NotePageComponent implements OnInit {
  notes: Note[] = [];
  showNotes = true;

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    this.loadNotes();
  }

  
  addNote() {
    const newNote = prompt('Ingrese una nueva nota');
    if (newNote && newNote.trim() !== '') {
      const note: Partial<Note> = {
        nota: newNote.trim()
      };
      this.noteService.create(note as Note)
        .subscribe(createdNote => {
          this.notes.push(createdNote);
          Swal.fire({
            icon: 'success',
            text: 'Nota agregada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        });
    }
  }

  deleteNote(index: number) {
    const noteId = this.notes[index].id;
    this.noteService.delete(noteId)
      .subscribe(() => {
        this.notes.splice(index, 1);
        Swal.fire({
          icon: 'success',
          text: 'Nota eliminada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      });
  }

  toggleNotesContainer() {
    this.showNotes = !this.showNotes;
  }

  loadNotes() {
    this.noteService.findAll()
      .subscribe(notes => {
        this.notes = notes;
      });
  }

  editNote(index: number) {
    const editedNote = prompt('Ingrese la nota modificada', this.notes[index].nota);
    if (editedNote && editedNote.trim() !== '') {
      const noteId = this.notes[index].id;
      const updatedNote: Note = {
        id: noteId,
        nota: editedNote.trim()
      };
      this.noteService.update(noteId, updatedNote)
        .subscribe(() => {
          this.notes[index].nota = editedNote.trim();
          Swal.fire({
            icon: 'success',
            text: 'Nota editada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        });
    }
  }
}
