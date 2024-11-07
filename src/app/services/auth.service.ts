import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  username = ''; 
  password = '';

  constructor(router: Router) {}

  getToken(): string {
    return localStorage.getItem("token") || '';
  }

  async login(username: string, password: string): Promise<boolean> {
    return fetch('http://localhost:4000/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  .then(r => r.json())
    .then(response => {
      if (response.status === 'ok') {
        localStorage.setItem('token', response.token);
        this.username = username; 
        return true;
      } else {
        return false;
      }
    })
    .catch(error => {
      console.error("Error en la solicitud de login:", error);
      return false;
    });
}

logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username'); 
  this.username = '';
  console.log("Sesión cerrada");
}
  estaLogueado():boolean {
    if (this.getToken()){
      return true;
    }else{
      return false;
    }
  }

}
