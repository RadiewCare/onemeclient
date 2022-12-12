import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowAnalysisDescriptionPageRoutingModule } from './show-analysis-description-routing.module';

import { ShowAnalysisDescriptionPage } from './show-analysis-description.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowAnalysisDescriptionPageRoutingModule
  ],
  declarations: [ShowAnalysisDescriptionPage]
})
export class ShowAnalysisDescriptionPageModule {}
