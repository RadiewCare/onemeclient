import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPhenotypicElementPageRoutingModule } from './add-phenotypic-element-routing.module';

import { AddPhenotypicElementPage } from './add-phenotypic-element.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPhenotypicElementPageRoutingModule
  ],
  declarations: [AddPhenotypicElementPage]
})
export class AddPhenotypicElementPageModule {}
