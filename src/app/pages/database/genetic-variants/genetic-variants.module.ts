import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { GeneticVariantsPageRoutingModule } from "./genetic-variants-routing.module";

import { GeneticVariantsPage } from "./genetic-variants.page";

import { AgGridModule } from "ag-grid-angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneticVariantsPageRoutingModule,
    AgGridModule.withComponents([])
  ],
  declarations: [GeneticVariantsPage]
})
export class GeneticVariantsPageModule {}
