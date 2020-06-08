import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddMutationPageRoutingModule } from './add-mutation-routing.module';

import { AddMutationPage } from './add-mutation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddMutationPageRoutingModule
  ],
  declarations: [AddMutationPage]
})
export class AddMutationPageModule {}
