import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAnalyticStudyPageRoutingModule } from './add-analytic-study-routing.module';

import { AddAnalyticStudyPage } from './add-analytic-study.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAnalyticStudyPageRoutingModule
  ],
  declarations: [AddAnalyticStudyPage]
})
export class AddAnalyticStudyPageModule {}
