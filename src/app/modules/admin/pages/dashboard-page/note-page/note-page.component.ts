import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-note-page',
  templateUrl: './note-page.component.html',
  styleUrls: ['./note-page.component.css']
})
export class NotePageComponent implements OnInit {
  notes: string[] = [];
  showNotes = true;

  ngOnInit() {
    this.loadNotes();
  }

  addNote() {
    const newNote = prompt('Ingrese una nueva nota');
    if (newNote && newNote.trim() !== '') {
      this.notes.push(newNote);
      this.saveNotes();
    }
  }

  deleteNote(index: number) {
    this.notes.splice(index, 1);
    this.saveNotes();
  }

  toggleNotesContainer() {
    this.showNotes = !this.showNotes;
  }

  saveNotes() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
  

  loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      this.notes = JSON.parse(savedNotes);
    }
  }

  editNote(index: number) {
    const editedNote = prompt('Ingrese la nota modificada', this.notes[index]);
    if (editedNote && editedNote.trim() !== '') {
      this.notes[index] = editedNote;
      this.saveNotes();
    }
  }
 
  

}
