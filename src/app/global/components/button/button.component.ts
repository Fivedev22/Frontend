import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() label!: string;
  @Input() background!: string;
  @Output() event: EventEmitter<void> = new EventEmitter<void>();

  public onClick(): void {
    this.event.emit();
  }
}
