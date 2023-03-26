import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.css'],
})
export class ForgotPasswordPageComponent implements OnInit {
  formForgotPassword!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formForgotPassword = this.initForm();
  }
  hasError(controlName: string, errorName: string) {
    return this.formForgotPassword.controls[controlName].hasError(errorName);
  }
  initForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.pattern('.+.com$')],
      ],
    });
  }
}
