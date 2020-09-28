import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhenotypicElementsPageRoutingModule } from './phenotypic-elements-routing.module';

import { PhenotypicElementsPage } from './phenotypic-elements.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhenotypicElementsPageRoutingModule
  ],
  declarations: [PhenotypicElementsPage]
})
export class PhenotypicElementsPageModule {}
