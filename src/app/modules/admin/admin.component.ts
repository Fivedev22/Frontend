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
    const element2 = document.getElementById('main-cont');
    const displayStyle = this.sideBarOpen ? 'none' : 'block';
    const displayStyle2 = this.sideBarOpen ? '0' : '250px';
    this.renderer.setStyle(element, 'display', displayStyle);
    this.renderer.setStyle(element2, 'margin-left', displayStyle2);
    this.sideBarOpen = !this.sideBarOpen;
  }
}
