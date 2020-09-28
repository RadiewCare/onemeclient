import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisElementsPageRoutingModule } from "./analysis-elements-routing.module";

import { AnalysisElementsPage } from "./analysis-elements.page";

import { AgGridModule } from "ag-grid-angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisElementsPageRoutingModule,
    AgGridModule.withComponents([])
  ],
  declarations: [AnalysisElementsPage]
})
export class AnalysisElementsPageModule {}
