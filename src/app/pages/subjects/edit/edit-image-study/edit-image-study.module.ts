import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditImageStudyPageRoutingModule } from './edit-image-study-routing.module';

import { EditImageStudyPage } from './edit-image-study.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditImageStudyPageRoutingModule
  ],
  declarations: [EditImageStudyPage]
})
export class EditImageStudyPageModule {}
