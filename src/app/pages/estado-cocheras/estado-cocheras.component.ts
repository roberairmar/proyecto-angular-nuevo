import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cochera';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { CocherasService } from '../../services/cocheras.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-estado-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './estado-cocheras.component.html',
  styleUrls: ['./estado-cocheras.component.scss']
})
export class EstadoCocherasComponent {
  esAdmin: boolean = true;
  filas: (Cochera & { activo: Estacionamiento | null })[] = [];
  siguienteNumero: number = 1;
  modalAbierto: boolean = false;
  

  auth = inject(AuthService);
  cocheras = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);


  ngOnInit() {
    this.traerCocheras();
  }
  Logout() {
    this.auth.logout();
  }

  traerCocheras() {
    this.cocheras.cocheras().then(cocheras => {
      this.filas = [];
      cocheras.forEach(cochera => {
        this.estacionamientos.buscarEstacionamientoActivo(cochera.id).then(estacionamiento => {
          this.filas.push({
            ...cochera,
            activo: estacionamiento,
          });
        });
      });
    });
  }

  async agregarFila() {
    try {
      await this.cocheras.agregar(); 
      console.log("Cochera agregada correctamente.");
      this.traerCocheras(); 
    } catch (error) {
      console.error('Error al agregar la cochera en la base de datos:', error);
      Swal.fire('Error', 'No se pudo agregar la cochera en la base de datos.', 'error');
    }
  }

  async actualizarCocheras() {
    this.filas = await this.cocheras.obtenerTodas();
  }
  acomodarCocheras() {
    this.filas.sort((a, b) => a.id - b.id);
  }

  habilitarCochera(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(!cochera?.deshabilitada){
      Swal.fire({
        icon: "warning",
        text: `La cochera ${cocheraId} ya se encuentra habilitada`,
      })
    }else{
      this.cocheras.habilitar(cochera).then(() => this.actualizarCocheras()).then(()=> this.acomodarCocheras());
    }
  }
  deshabilitarCochera(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(cochera.activo){
      Swal.fire({
        icon: "error",
        title: "Cochera ocupada",
      })
    } else if(cochera?.deshabilitada){
      Swal.fire({
        icon: "warning",
        text: `La cochera ${cocheraId} ya se encuentra deshabilitada`,
      })
    }else{
      this.cocheras.deshabilitar(cochera).then(() => this.actualizarCocheras()).then(()=> this.acomodarCocheras());
    }
  }

  abrirModalEliminarCochera(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(!cochera.activo){
      Swal.fire({
        title: `Está seguro de eliminar la cochera ${cocheraId}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar cochera",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed){
          this.cocheras.eliminar(cochera).then(() => this.actualizarCocheras()).then(()=> this.acomodarCocheras());
        }
      });
    } else{
      Swal.fire({
        icon: "error",
        title: "Cochera ocupada",
        text: `Para eliminar la cochera ${cocheraId}, primero debe cerrarse`,
      })
    }
  }
  async cambiarDisponibilidadCochera(cocheraId: number) {
    const cochera = this.filas.find(f => f.id === cocheraId);
    if (!cochera) {
      console.error('No se encontró la cochera');
      return;
    }
    try {
      const nuevaDisponibilidad = !cochera.disponible;
      await this.cocheras.cambiarDisponibilidad(cocheraId, nuevaDisponibilidad);
      cochera.disponible = nuevaDisponibilidad;
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la disponibilidad de la cochera'
      });
    }
  }

  abrirModalEstacionarAuto(idCochera: number) {
    Swal.fire({
      title: "Ingrese la patente del vehículo",
      input: "text",
      inputPlaceholder: "ABP 474",
      confirmButtonColor: "#034CBE",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "¡Ingrese una patente válida!";
        }
        return;
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.estacionamientos.estacionarAuto(res.value, idCochera).then(() => {
          Swal.fire("Estacionamiento confirmado", "El vehículo fue estacionado correctamente.", "success");

          this.traerCocheras();
        }).catch(error => {
          console.error("Error al abrir el estacionamiento:", error);
        });
      }
    });
  }

  cobrarEstacionamiento(idCochera: number) {
    this.estacionamientos.buscarEstacionamientoActivo(idCochera).then(estacionamiento => {
      if (!estacionamiento) {
        Swal.fire({
          title: "Error",
          text: "No se encontró un estacionamiento activo para la cochera",
          icon: "error"
        });
        return;
      }

      // Cálculo del tiempo transcurrido
      const horaIngreso = new Date(estacionamiento.horaIngreso);
      const tiempoTranscurridoMs = new Date().getTime() - horaIngreso.getTime();
      const horas = Math.floor(tiempoTranscurridoMs / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoTranscurridoMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Cálculo del precio 
      const horasRedondeadas = Math.ceil(tiempoTranscurridoMs / (1000 * 60 * 60));
      const TARIFA_POR_HORA = 100; // Definir la tarifa por hora
      const precio = horasRedondeadas * TARIFA_POR_HORA;
  
      Swal.fire({
        title: "Liberar cochera",
        html: `
          <div>
            <p>Patente: ${estacionamiento.patente}</p>
            <p>Tiempo transcurrido: ${horas}hs ${minutos}mins</p>
            <p>Monto a pagar: $${precio.toFixed(2)}</p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#00c98d",
        cancelButtonColor: "#d33",
        confirmButtonText: "Liberar cochera",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.estacionamientos.cobrarEstacionamiento(idCochera, estacionamiento.patente, precio)
            .then(() => {
              Swal.fire({
                title: "Cochera liberada",
                text: "La cochera ha sido liberada correctamente.",
                icon: "success"
              });
              this.traerCocheras();
            })
            .catch(error => {
              console.error("Error al liberar la cochera:", error);
              Swal.fire("Error", "Hubo un error al liberar la cochera.", "error");
            });
        }
      });
    }).catch(error => {
      console.error("Error al buscar el estacionamiento activo:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un error al buscar el estacionamiento.",
        icon: "error"
      });
    });
}

cerrarEstacionamientoModal(idCochera: number) {
  this.estacionamientos.buscarEstacionamientoActivo(idCochera).then(estacionamiento => {
    if (!estacionamiento || !estacionamiento.horaIngreso) {
      Swal.fire({
        title: "Error",
        text: "No se encontró un estacionamiento activo para la cochera",
        icon: "error"
      });
      return;
    }

    // Cálculo del tiempo transcurrido
    const horaIngreso = typeof estacionamiento.horaIngreso === 'string' 
      ? new Date(estacionamiento.horaIngreso)
      : estacionamiento.horaIngreso;
      
    const tiempoTranscurridoMs = new Date().getTime() - horaIngreso.getTime();
    const horas = Math.floor(tiempoTranscurridoMs / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoTranscurridoMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Cálculo del precio
    const horasRedondeadas = Math.ceil(tiempoTranscurridoMs / (1000 * 60 * 60));
    const TARIFA_POR_HORA = 100; // Definir la tarifa por hora
    const precio = horasRedondeadas * TARIFA_POR_HORA;

    Swal.fire({
      title: "Cobrar Estacionamiento",
      html: `
        <div class="detalles-cobro">
          <p><strong>Patente:</strong> ${estacionamiento.patente}</p>
          <p><strong>Tiempo estacionado:</strong> ${horas}hs ${minutos}mins</p>
          <p><strong>Total a pagar:</strong> $${precio.toFixed(2)}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00c98d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Cobrar y Liberar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.estacionamientos.cobrarEstacionamiento(idCochera, estacionamiento.patente, precio)
          .then(() => {
            this.traerCocheras(); 
            return Swal.fire({ 
              title: "Cobro exitoso",
              text: `Se cobró $${precio.toFixed(2)} y se liberó la cochera`,
              icon: "success"
            });
          })
          .catch(error => {
            console.error("Error al cobrar el estacionamiento:", error);
            Swal.fire({
              title: "Error",
              text: error.message || "Hubo un error al procesar el cobro",
              icon: "error"
            });
          });
      }
    });
  }).catch(error => {
    console.error("Error al buscar el estacionamiento activo:", error);
    Swal.fire({
      title: "Error",
      text: "Hubo un error al buscar el estacionamiento",
      icon: "error"
    });
  });
}
  getFormattedHoraIngreso(horaIngreso: string | undefined): string {
    return horaIngreso ? new Date(horaIngreso).toLocaleString() : 'Sin ingreso';
  }
  
}

