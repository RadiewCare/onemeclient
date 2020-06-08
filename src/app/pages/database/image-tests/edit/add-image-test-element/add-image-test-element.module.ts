import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddImageTestElementPageRoutingModule } from './add-image-test-element-routing.module';

import { AddImageTestElementPage } from './add-image-test-element.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddImageTestElementPageRoutingModule
  ],
  declarations: [AddImageTestElementPage]
})
export class AddImageTestElementPageModule {}
