import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  formLogin!: FormGroup;
  hide = true;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.formLogin = this.initForm();
  }

  onLogin(): void {
    this.authService.login(this.formLogin.value).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  hasError(controlName: string, errorName: string) {
    return this.formLogin.controls[controlName].hasError(errorName);
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      password: ['', Validators.required],
    });
  }
}
