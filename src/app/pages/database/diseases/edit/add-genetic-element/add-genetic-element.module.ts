import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AddGeneticElementPageRoutingModule } from "./add-genetic-element-routing.module";

import { AddGeneticElementPage } from "./add-genetic-element.page";
import { IonicSelectableModule } from "ionic-selectable";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddGeneticElementPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddGeneticElementPage]
})
export class AddGeneticElementPageModule {}
