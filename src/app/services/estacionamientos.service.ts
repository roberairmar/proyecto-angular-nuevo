import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientosService {
  private auth = inject(AuthService);

  async estacionamientos(): Promise<Estacionamiento[]> {
    try {
      const response = await fetch(`http://localhost:4000/estacionamientos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.auth.getToken() ?? ''}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching estacionamientos:', error);
      throw error;
    }
  }

  async buscarEstacionamientoActivo(cocheraId: number): Promise<Estacionamiento | null> {
    try {
      const estacionamientos = await this.estacionamientos();
      return estacionamientos.find(estacionamiento => 
        estacionamiento.idCochera === cocheraId && 
        estacionamiento.horaEgreso === null
      ) ?? null;
    } catch (error) {
      console.error('Error buscando estacionamiento activo:', error);
      throw error;
    }
  }

  estacionarAuto(patente: string, idCochera: number) {
    const username = this.auth.getToken(); 
    return fetch(`http://localhost:4000/estacionamientos/abrir`, {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + this.auth.getToken(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patente,
        idCochera,
        username
      })
    }).then(response => {
      if (!response.ok) throw new Error('Error al abrir el estacionamiento');
      return response.json();
    });
  }
  cobrarEstacionamiento(idCochera: number, patente: string, costo: number) {
    return fetch(`http://localhost:4000/estacionamientos/cerrar/`, {
      method: 'PATCH',
      headers: {
        Authorization: "Bearer " + this.auth.getToken(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patente: patente,
        idCochera: idCochera,
        costo: costo 
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      return response.json();
    });
}
}