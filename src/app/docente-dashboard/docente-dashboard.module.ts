import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocenteDashboardPageRoutingModule } from './docente-dashboard-routing.module';

import { DocenteDashboardPage } from './docente-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocenteDashboardPageRoutingModule
  ],
  declarations: [DocenteDashboardPage]
})
export class DocenteDashboardPageModule {}
