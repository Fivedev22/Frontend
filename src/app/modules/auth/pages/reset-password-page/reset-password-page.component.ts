import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css'],
})
export class ResetPasswordPageComponent implements OnInit {
  formResetPassword!: FormGroup;
  hide = false;
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formResetPassword = this.initForm();
  }

  hasError(controlName: string, errorName: string) {
    return this.formResetPassword.controls[controlName].hasError(errorName);
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', [Validators.required]],
    });
  }
}
