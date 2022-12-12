import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AgGridModule } from 'ag-grid-angular';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { HttpClientModule } from '@angular/common/http'

import { SubjectsImageTestsMiningPageRoutingModule } from './subjectsImageTestsMining-routing.module';
import { SubjectsImageTestsMiningPage } from './subjectsImageTestsMining.page';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgGridModule,
    AgChartsAngularModule,
    HttpClientModule,
    SubjectsImageTestsMiningPageRoutingModule
  ],
  declarations: [SubjectsImageTestsMiningPage]
})
export class SubjectsImageTestsMiningPageModule {}
