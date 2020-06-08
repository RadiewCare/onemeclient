import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddImageStudyPageRoutingModule } from './add-image-study-routing.module';

import { AddImageStudyPage } from './add-image-study.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddImageStudyPageRoutingModule
  ],
  declarations: [AddImageStudyPage]
})
export class AddImageStudyPageModule {}
