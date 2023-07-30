
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {


  constructor(
    private router: Router
  ) {}

  ngOnInit(){
    let token =  localStorage.getItem('anahi.token');

    token ?  this.router.navigate(['/admin'])  : null
  }
}
