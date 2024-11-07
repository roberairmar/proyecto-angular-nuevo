import { Estacionamiento } from "./estacionamiento";

export interface Cochera {
    id: number;
    activo: Estacionamiento | null;
    deshabilitada: boolean;
    disponible: boolean;
    horaDeshabilitacion?: Date | null;
    eliminada: boolean
    descripcion:string, 
  }