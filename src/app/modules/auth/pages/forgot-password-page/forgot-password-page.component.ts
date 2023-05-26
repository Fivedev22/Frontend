import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.css'],
})
export class ForgotPasswordPageComponent implements OnInit {
  formForgotPassword!: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

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

  sendEmail() {
    console.log(this.formForgotPassword.value);
    

    this.authService.solicitarRestablecerContrasenia(this.formForgotPassword.value).subscribe(
      (data) => {
        if (!data) {
          this.Alert('Correo incorrecto', 'warning', '#F25D5D', '#fff');
        } else {
          this.Alert('Te enviamos un correo', 'success', '#75CB8D', '#fff');

          localStorage.setItem('anahi.refreshToken', data.resetToken);

          setTimeout(()=>{
            this.router.navigate(["auth/success-forgot-password"])
          }, 1200)
         
         
        }
      },
      (error) => {
        this.Alert('Correo incorrecto', 'warning', '#F25D5D', '#fff');
        console.error(error);
        
      }
    );
  }

  Alert(msg: any, status: any, bgColor: any, color : any ) {
    const Toast = Swal.mixin({
      toast: true,
      width: "30%" ,
      position: 'top',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background:  bgColor,
      color: color,
    });

    Toast.fire({
      icon: status,
      title: msg,
      iconColor: '#fff',
    });
  }
}
