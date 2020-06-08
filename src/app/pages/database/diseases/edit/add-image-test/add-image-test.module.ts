import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddImageTestPageRoutingModule } from './add-image-test-routing.module';

import { AddImageTestPage } from './add-image-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddImageTestPageRoutingModule
  ],
  declarations: [AddImageTestPage]
})
export class AddImageTestPageModule {}
