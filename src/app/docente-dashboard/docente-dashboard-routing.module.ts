import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocenteDashboardPage } from './docente-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DocenteDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocenteDashboardPageRoutingModule {}
