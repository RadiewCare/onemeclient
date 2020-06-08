import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAnalysisElementPageRoutingModule } from './add-analysis-element-routing.module';

import { AddAnalysisElementPage } from './add-analysis-element.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAnalysisElementPageRoutingModule
  ],
  declarations: [AddAnalysisElementPage]
})
export class AddAnalysisElementPageModule {}
