import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisElementsPage } from "./analysis-elements.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisElementsPage
  },
  {
    path: "create",
    loadChildren: () =>
      import("./create/create.module").then((m) => m.CreatePageModule)
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
export class AnalysisElementsPageRoutingModule {}
