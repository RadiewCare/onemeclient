import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MutationsPageRoutingModule } from "./mutations-routing.module";

import { MutationsPage } from "./mutations.page";

import { AgGridModule } from "ag-grid-angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MutationsPageRoutingModule,
    AgGridModule
  ],
  declarations: [MutationsPage]
})
export class MutationsPageModule {}
