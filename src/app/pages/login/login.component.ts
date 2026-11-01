import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { describeError } from '../../core/api-error';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  providers:[
    LoginService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  loginForm!: FormGroup;
  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ){
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  ngOnInit(): void {
    this.clearLocalStorage();
  }

  submit(){
    this.loginService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: () => {this.router.navigate(['/home']);},
      error: (error) => {
        Swal.fire({
          title: 'Erro no Login',
          text: describeError(error),
          icon: 'error',
          confirmButtonColor: '#046B46',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
      
    })
  }

  navigate(){
    this.router.navigate(["/signup"])
  }

  recoverPassword(): void {
    Swal.fire({
        title: 'Recuperar Senha',
        html: `
            <input type="email" id="recoverEmail" class="swal2-input" placeholder="Digite seu e-mail">
        `,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#046B46',
        preConfirm: (): string | null => {
            const recoverEmail = (Swal.getPopup()!.querySelector('#recoverEmail') as HTMLInputElement).value;
            if (!recoverEmail) {
                Swal.showValidationMessage('Por favor, digite um e-mail');
                return null;
            }
            return recoverEmail;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            Swal.fire({
                title: 'Sucesso',
                text: 'Foi enviado um link de recuperação no e-mail cadastrado',
                icon: 'success',
                confirmButtonColor: '#046B46',
            });
        }
    });
  }

  clearLocalStorage(){
    this.session.clear();
  }

}
