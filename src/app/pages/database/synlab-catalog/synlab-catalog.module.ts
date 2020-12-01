import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SynlabCatalogPageRoutingModule } from './synlab-catalog-routing.module';

import { SynlabCatalogPage } from './synlab-catalog.page';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SynlabCatalogPageRoutingModule,
    AgGridModule.withComponents([])
  ],
  declarations: [SynlabCatalogPage]
})
export class SynlabCatalogPageModule { }
