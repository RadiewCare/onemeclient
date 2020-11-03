import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageTestsElementsPageRoutingModule } from './image-tests-elements-routing.module';

import { ImageTestsElementsPage } from './image-tests-elements.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageTestsElementsPageRoutingModule
  ],
  declarations: [ImageTestsElementsPage]
})
export class ImageTestsElementsPageModule {}
