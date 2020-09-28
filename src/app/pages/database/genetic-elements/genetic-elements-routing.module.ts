import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { GeneticElementsPage } from "./genetic-elements.page";

const routes: Routes = [
  {
    path: "",
    component: GeneticElementsPage
  },
  {
    path: "edit/:id",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneticElementsPageRoutingModule {}
