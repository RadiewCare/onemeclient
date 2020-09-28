import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FamiliarsPageRoutingModule } from './familiars-routing.module';

import { FamiliarsPage } from './familiars.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FamiliarsPageRoutingModule
  ],
  declarations: [FamiliarsPage]
})
export class FamiliarsPageModule {}
