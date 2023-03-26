import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  formLogin!: FormGroup;
  hide = true;
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formLogin = this.initForm();
  }

  hasError(controlName: string, errorName: string) {
    return this.formLogin.controls[controlName].hasError(errorName);
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      user: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      password: ['', Validators.required],
    });
  }
}
