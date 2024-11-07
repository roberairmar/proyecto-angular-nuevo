export interface Estacionamiento{
    id:number;
    patente:string;
    horaIngreso: string | Date;
    horaEgreso: string | Date;
    costo: number|null
    idUsuarioIngreso:string,
    idUsuarioEgreso:string|null,
    idCochera:number,
    eliminado:null,
    eliminada: boolean
}