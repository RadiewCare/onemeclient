import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AddAnalysisElementPage } from "./add-analysis-element.page";

const routes: Routes = [
  {
    path: "",
    component: AddAnalysisElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddAnalysisElementPageRoutingModule {}
