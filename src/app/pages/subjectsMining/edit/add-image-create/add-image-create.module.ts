import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddImageCreatePageRoutingModule } from './add-image-create-routing.module';

import { AddImageCreatePage } from './add-image-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddImageCreatePageRoutingModule
  ],
  declarations: [AddImageCreatePage]
})
export class AddImageCreatePageModule {}
