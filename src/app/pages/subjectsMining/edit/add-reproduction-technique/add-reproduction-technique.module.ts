import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddReproductionTechniquePageRoutingModule } from './add-reproduction-technique-routing.module';

import { AddReproductionTechniquePage } from './add-reproduction-technique.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddReproductionTechniquePageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddReproductionTechniquePage]
})
export class AddReproductionTechniquePageModule { }
