import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClinicAnalysisPageRoutingModule } from './clinic-analysis-routing.module';

import { ClinicAnalysisPage } from './clinic-analysis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClinicAnalysisPageRoutingModule
  ],
  declarations: [ClinicAnalysisPage]
})
export class ClinicAnalysisPageModule {}
