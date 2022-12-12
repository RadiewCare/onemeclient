import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditReproductionTestPageRoutingModule } from './edit-reproduction-test-routing.module';

import { EditReproductionTestPage } from './edit-reproduction-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditReproductionTestPageRoutingModule
  ],
  declarations: [EditReproductionTestPage]
})
export class EditReproductionTestPageModule {}
