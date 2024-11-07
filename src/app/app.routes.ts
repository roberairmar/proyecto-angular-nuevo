import { Router, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { EstadoCocherasComponent } from './pages/estado-cocheras/estado-cocheras.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ReportesComponent } from './pages/reportes/reportes.component';

function guardarLogueado(){
    let auth = inject(AuthService);
    let router = inject(Router);
    
    if (auth.estaLogueado()){
        return true;
    }else{
        router.navigate(["/login"]);
        return false;
    }
}
export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "estado-cocheras",
        component: EstadoCocherasComponent,
        canActivate: [guardarLogueado]
    },
    {
        path: "reportes",
        component: ReportesComponent,
        canActivate: [guardarLogueado]
    },
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
    }
];