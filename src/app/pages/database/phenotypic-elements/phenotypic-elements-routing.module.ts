import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PhenotypicElementsPage } from "./phenotypic-elements.page";

const routes: Routes = [
  {
    path: "",
    component: PhenotypicElementsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhenotypicElementsPageRoutingModule {}
