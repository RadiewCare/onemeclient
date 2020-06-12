import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AddPhenotypicElementPageRoutingModule } from "./add-phenotypic-element-routing.module";

import { AddPhenotypicElementPage } from "./add-phenotypic-element.page";
import { IonicSelectableModule } from "ionic-selectable";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPhenotypicElementPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddPhenotypicElementPage]
})
export class AddPhenotypicElementPageModule {}
