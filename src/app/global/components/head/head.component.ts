import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css'],
})
export class HeadComponent {
  @Input() title!: string;
}
