import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrugElementsPageRoutingModule } from './drug-elements-routing.module';

import { DrugElementsPage } from './drug-elements.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DrugElementsPageRoutingModule
  ],
  declarations: [DrugElementsPage]
})
export class DrugElementsPageModule {}
