import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AddAnalysisElementPageRoutingModule } from "./add-analysis-element-routing.module";

import { AddAnalysisElementPage } from "./add-analysis-element.page";
import { IonicSelectableModule } from "ionic-selectable";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAnalysisElementPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddAnalysisElementPage]
})
export class AddAnalysisElementPageModule {}
