import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-forgot-password-page',
  templateUrl: './success-forgot-password-page.component.html',
  styleUrls: ['./success-forgot-password-page.component.css'],
})
export class SuccessForgotPasswordPageComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  BackLogin() {
    this.router.navigate(['auth/login']);
  }
}
