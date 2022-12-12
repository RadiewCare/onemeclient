import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http'

import { SubjectsMiningPageRoutingModule } from './subjectsMining-routing.module';
import { SubjectsMiningPage } from './subjectsMining.page';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgGridModule,
    HttpClientModule,
    SubjectsMiningPageRoutingModule
  ],
  declarations: [SubjectsMiningPage]
})
export class SubjectsMiningPageModule {}
