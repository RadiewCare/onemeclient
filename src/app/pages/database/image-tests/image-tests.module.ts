import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageTestsPageRoutingModule } from './image-tests-routing.module';

import { ImageTestsPage } from './image-tests.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageTestsPageRoutingModule
  ],
  declarations: [ImageTestsPage]
})
export class ImageTestsPageModule {}
