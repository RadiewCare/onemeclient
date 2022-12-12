import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GeneticsPageRoutingModule } from './genetics-routing.module';

import { GeneticsPage } from './genetics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneticsPageRoutingModule
  ],
  declarations: [GeneticsPage]
})
export class GeneticsPageModule {}
