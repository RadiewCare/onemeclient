import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditQuibimPageRoutingModule } from './edit-quibim-routing.module';

import { EditQuibimPage } from './edit-quibim.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditQuibimPageRoutingModule
  ],
  declarations: [EditQuibimPage]
})
export class EditQuibimPageModule {}
