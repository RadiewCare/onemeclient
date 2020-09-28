import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAnalyticStudyPageRoutingModule } from './edit-analytic-study-routing.module';

import { EditAnalyticStudyPage } from './edit-analytic-study.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditAnalyticStudyPageRoutingModule
  ],
  declarations: [EditAnalyticStudyPage]
})
export class EditAnalyticStudyPageModule {}
