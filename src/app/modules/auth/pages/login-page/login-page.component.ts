import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

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
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formLogin = this.initForm();
  }

  onLogin(): void {
    console.log(this.formLogin.value);

    this.authService.ingresar(this.formLogin.value).subscribe(
      (data) => {


        if (!data) {

          this.Alert('Datos incorrectos', 'warning', '#F25D5D', '#fff');
        } else {
          this.Alert('Autenticación correcta', 'success', '#75CB8D', '#fff');

          localStorage.setItem(
            'name',
            this.formLogin.get('username')?.value
          );

          setTimeout(() => {
            this.tokenService.setToken(data.token);
            localStorage.setItem('anahi.accesstoken', data.token);
            this.router.navigate(['/admin']);
          }, 1900);
        }
      },
      (error) => {
        this.Alert('Datos incorrectos', 'warning', '#F25D5D', '#fff');
        console.error(error);
      }
    );
  }

  hasError(controlName: string, errorName: string) {
    return this.formLogin.controls[controlName].hasError(errorName);
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      username: [null, [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      password: [null, Validators.required],
    });
  }

  Alert(msg: any, status: any, bgColor: any, color: any) {
    const Toast = Swal.mixin({
      toast: true,
      width: "30%",
      position: 'top',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background: bgColor,
      color: color,
    });

    Toast.fire({
      icon: status,
      title: msg,
      iconColor: '#fff',
    });
  }
}
