import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Cochera } from '../interfaces/cochera';

@Injectable({
  providedIn: 'root',
})
export class CocherasService {

  auth = inject(AuthService);

  cocheras(): Promise<Cochera[]> {
    return fetch('http://localhost:4000/cocheras', {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + (this.auth.getToken() ?? ''),
      },
    }).then(r => r.json());
  }
  
  agregar(){
    return fetch("http://localhost:4000/cocheras",{
      method: "POST",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? ""),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ descripcion: "Agregada por api" })
    }).then(res => res.json());
  }

  eliminar(cochera: Cochera){
    return fetch(`http://localhost:4000/cocheras/${cochera.id}`, {
      method: "DELETE",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }
  cambiarDisponibilidad(cocheraId: number, disponible: boolean): Promise<void> {
    return fetch(`${'http://localhost:4000/cocheras'}/${cocheraId}/disponibilidad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible }),
    })
      .then(response => {
        if (!response.ok) throw new Error('Error al cambiar disponibilidad de la cochera');
      })
      .catch(error => {
        console.error('Error al cambiar disponibilidad de la cochera:', error);
        throw error;
      });
  }
  obtenerTodas(): Promise<Cochera[]> {
    return fetch('http://localhost:4000/cocheras', {
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener cocheras');
      return response.json();
    })
    .catch(error => {
      console.error('Error al obtener cocheras:', error);
      return [];
    });
  }
  habilitar(cochera: Cochera): Promise<Cochera> {
    return fetch(`http://localhost:4000/cocheras/${cochera.id}/enable`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  deshabilitar(cochera: Cochera): Promise<Cochera> {
    return fetch(`http://localhost:4000/cocheras/${cochera.id}/disable`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }
}