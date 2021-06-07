import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowEmbryoDetailsPageRoutingModule } from './show-embryo-details-routing.module';

import { ShowEmbryoDetailsPage } from './show-embryo-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowEmbryoDetailsPageRoutingModule
  ],
  declarations: [ShowEmbryoDetailsPage]
})
export class ShowEmbryoDetailsPageModule {}
