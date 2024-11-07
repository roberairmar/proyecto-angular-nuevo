import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Estacionamiento } from '../../interfaces/estacionamiento';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    CommonModule 
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  auth = inject(AuthService);
  estacionamientos: Estacionamiento[] = [];
  reporteEstacionamientos: any[] = [];

  ngOnInit(): void {
    this.traerEstacionamientos();
  }

  traerEstacionamientos() {
    fetch('http://localhost:4000/estacionamientos', {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.auth.getToken()
      }
    })
      .then((response) => response.json())
      .then((data: Estacionamiento[]) => { 
        const historialEstacionamientos = data.filter(estacionada => estacionada.horaEgreso != null);

        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const mesesTrabajo: string[] = [];

        for (let estacionada of historialEstacionamientos) {
          const estacionadaConDate = { ...estacionada, horaIngreso: new Date(estacionada.horaIngreso) };
          const periodo = meses[estacionadaConDate.horaIngreso.getMonth()] + " " + estacionadaConDate.horaIngreso.getFullYear();

          if (!mesesTrabajo.includes(periodo)) {
            mesesTrabajo.push(periodo);
            this.reporteEstacionamientos.push({
              nro: this.reporteEstacionamientos.length + 1,
              mes: periodo,
              usos: 1,
              cobrado: estacionada.costo ?? 0
            });
          } else {
            
            const reporte = this.reporteEstacionamientos.find(r => r.mes === periodo);
            if (reporte) {
              reporte.usos++;
              reporte.cobrado += estacionada.costo ?? 0;
            }
          }
        }

        console.log("Reporte de estacionamientos agrupado:", this.reporteEstacionamientos);
      })
      .catch((error) => {
        console.error("Error fetching estacionamientos:", error);
      });
  }
}