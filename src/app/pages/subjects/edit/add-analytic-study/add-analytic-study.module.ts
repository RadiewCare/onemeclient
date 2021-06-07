import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAnalyticStudyPageRoutingModule } from './add-analytic-study-routing.module';

import { AddAnalyticStudyPage } from './add-analytic-study.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAnalyticStudyPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddAnalyticStudyPage]
})
export class AddAnalyticStudyPageModule { }
