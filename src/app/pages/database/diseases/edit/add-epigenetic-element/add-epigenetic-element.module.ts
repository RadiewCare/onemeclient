import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEpigeneticElementPageRoutingModule } from './add-epigenetic-element-routing.module';

import { AddEpigeneticElementPage } from './add-epigenetic-element.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEpigeneticElementPageRoutingModule
  ],
  declarations: [AddEpigeneticElementPage]
})
export class AddEpigeneticElementPageModule {}
