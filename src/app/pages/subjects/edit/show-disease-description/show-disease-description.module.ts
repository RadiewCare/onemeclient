import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowDiseaseDescriptionPageRoutingModule } from './show-disease-description-routing.module';

import { ShowDiseaseDescriptionPage } from './show-disease-description.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowDiseaseDescriptionPageRoutingModule
  ],
  declarations: [ShowDiseaseDescriptionPage]
})
export class ShowDiseaseDescriptionPageModule {}
