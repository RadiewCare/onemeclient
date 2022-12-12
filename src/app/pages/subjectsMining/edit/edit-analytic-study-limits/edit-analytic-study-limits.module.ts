import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAnalyticStudyLimitsPageRoutingModule } from './edit-analytic-study-limits-routing.module';

import { EditAnalyticStudyLimitsPage } from './edit-analytic-study-limits.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditAnalyticStudyLimitsPageRoutingModule
  ],
  declarations: [EditAnalyticStudyLimitsPage]
})
export class EditAnalyticStudyLimitsPageModule {}
