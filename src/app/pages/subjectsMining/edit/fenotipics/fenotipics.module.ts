import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FenotipicsPageRoutingModule } from './fenotipics-routing.module';

import { FenotipicsPage } from './fenotipics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FenotipicsPageRoutingModule
  ],
  declarations: [FenotipicsPage]
})
export class FenotipicsPageModule {}
