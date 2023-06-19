import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  username!: any;

  constructor(private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('name');
  }

  logOut() {
    localStorage.removeItem('anahi.accesstoken');
    this.router.navigate(['/auth']);
  }

  toggle() {
    this.toggleSideBarForMe.emit();
  }
  goToWebPage() {
    const externalUrl = 'https://anahiapartamentosweb.vercel.app/';
    window.open(externalUrl, '_blank');
  }
}
