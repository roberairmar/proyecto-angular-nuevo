import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  mostrarError: boolean = false;
  mensajeError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  Login() {
    this.authService.login(this.username, this.password).then(res => {
      if (res) {
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/estado-cocheras']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña o Usuario incorrectos',
          text: 'Inténtalo de nuevo',
        });
        this.password = ''; 
      }
    })
  }

  
}