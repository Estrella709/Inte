import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { AttendancePage } from './attendance/attendance.page';
import { DocenteDashboardPage } from './docente-dashboard/docente-dashboard.page'; // Asegúrate de crear la página de reportes
import { UsuariosPage } from './usuarios/usuarios.page'; // Importa la página de Usuarios

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then(m => m.AttendancePageModule),
  },
  {
    path: 'docente-dashboard',  // Ruta para docentes
    loadChildren: () => import('./docente-dashboard/docente-dashboard.module').then(m => m.DocenteDashboardPageModule),
  },
  {
    path: 'admin-dashboard',  // Ruta para administrativos
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule),
  },
  {
    path: 'docente-dashboard',
    loadChildren: () => import('./docente-dashboard/docente-dashboard.module').then( m => m.DocenteDashboardPageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
