import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { IResetPassword } from '../../interfaces/reset-password.interface';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css'],
})
export class ResetPasswordPageComponent implements OnInit {
  formResetPassword!: FormGroup;
  usuario!: IResetPassword;
  hide = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

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

  ChangePassword() {
    let token: any = localStorage.getItem('anahi.refreshToken');

    const newPassword = this.formResetPassword.get('newPassword')?.value;
    const confirmPassword =
      this.formResetPassword.get('confirmPassword')?.value;

    if (newPassword != confirmPassword) {
      this.AlertError();
    } else {
      this.usuario = new IResetPassword(
        token,
        this.formResetPassword.get('confirmPassword')?.value
      );

      this.authService.restablecerContrasenia(this.usuario).subscribe(
        (data) => {
          this.AlertSuccess();
          this.router.navigate(['/auth']);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  AlertError() {
    const Toast = Swal.mixin({
      toast: true,
      width: '30%',
      position: 'top',
      showConfirmButton: false,
      timer: 2000,
      background: '#F25D5D',
      color: '#FFF',
      timerProgressBar: true,
    });

    Toast.fire({
      icon: 'warning',
      title: 'Las contraseñas no coinciden',
      iconColor: '#FFF',
    });
  }

  AlertSuccess() {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background: '#75CB8D',
      color: '#FFF',
    });

    Toast.fire({
      icon: 'success',
      title: `Contraseña cambiada correctamente`,
      iconColor: '#fff',
    });
  }
}
