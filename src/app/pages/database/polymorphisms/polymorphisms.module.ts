import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { PolymorphismsPageRoutingModule } from "./polymorphisms-routing.module";

import { PolymorphismsPage } from "./polymorphisms.page";

import { AgGridModule } from "ag-grid-angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PolymorphismsPageRoutingModule,
    AgGridModule
  ],
  declarations: [PolymorphismsPage]
})
export class PolymorphismsPageModule {}
