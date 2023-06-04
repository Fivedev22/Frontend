import { Component, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void { }

  logOut() {
    localStorage.removeItem("anahi.accesstoken");
    this.router.navigate(['/auth']);
  }

  toggle() {
    this.toggleSideBarForMe.emit();
  }
  goToWebPage() {
    const externalUrl = 'https://anahiapartamentosweb.vercel.app/';
    window.location.href = externalUrl;
  }
}
