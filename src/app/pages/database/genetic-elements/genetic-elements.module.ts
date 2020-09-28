import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { GeneticElementsPageRoutingModule } from "./genetic-elements-routing.module";

import { GeneticElementsPage } from "./genetic-elements.page";
import { AgGridModule } from "ag-grid-angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneticElementsPageRoutingModule,
    AgGridModule
  ],
  declarations: [GeneticElementsPage]
})
export class GeneticElementsPageModule {}
