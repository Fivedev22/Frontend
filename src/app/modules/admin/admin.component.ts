import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {}

  sideBarOpen = true;

  sideBarToggler(event: Event) {
    const element = document.getElementById('toggle');
    const displayStyle = this.sideBarOpen ? 'none' : 'block';
    this.renderer.setStyle(element, 'display', displayStyle);
    this.sideBarOpen = !this.sideBarOpen;
  }
}
