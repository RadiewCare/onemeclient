import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http'

import { SubjectsPageRoutingModule } from './subjects-routing.module';
import { SubjectsPage } from './subjects.page';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgGridModule,
    HttpClientModule,
    SubjectsPageRoutingModule
  ],
  declarations: [SubjectsPage]
})
export class SubjectsPageModule {}
