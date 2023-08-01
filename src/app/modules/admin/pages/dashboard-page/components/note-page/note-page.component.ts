import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Note } from 'src/app/interfaces/note.inteface';
import { NoteService } from 'src/app/services/note.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-note-page',
  templateUrl: './note-page.component.html',
  styleUrls: ['./note-page.component.css'],
})
export class NotePageComponent implements OnInit {
  notes: Note[] = [];
  noteForm!: FormGroup;

  constructor(
    private noteService: NoteService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.noteForm = this.initForm();
    this.loadNotes();
  }

  addNote() {
    if (this.noteForm.valid) {
      this.noteService.create(this.noteForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            text: 'Nota agregada',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.loadNotes();
            this.noteForm.reset();
          });
        },
      });
    }
  }

  deleteNote(noteId: number) {
    this.noteService.delete(noteId).subscribe(() => {
      Swal.fire({
        icon: 'success',
        text: 'Nota eliminada exitosamente',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        this.loadNotes();
      });
    });
  }

  loadNotes() {
    this.noteService.findAll().subscribe((notes) => {
      this.notes = notes;
    });
  }

  editNote(index: number) {
    const editedNote = prompt(
      'Ingrese la nota modificada',
      this.notes[index].nota
    );
    if (editedNote && editedNote.trim() !== '') {
      const noteId = this.notes[index].id;
      const updatedNote: Note = {
        id: noteId,
        nota: editedNote.trim(),
      };
      this.noteService.update(noteId, updatedNote).subscribe(() => {
        this.notes[index].nota = editedNote.trim();
        Swal.fire({
          icon: 'success',
          text: 'Nota editada exitosamente',
          timer: 2000,
          showConfirmButton: false,
        });
      });
    }
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      nota: ['', Validators.required],
    });
  }
  public hasError = (controlName: string, errorName: string) => {
    return this.noteForm.controls[controlName].hasError(errorName);
  };
}
