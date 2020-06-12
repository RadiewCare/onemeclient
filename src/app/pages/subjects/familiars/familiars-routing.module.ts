import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { FamiliarsPage } from "./familiars.page";

const routes: Routes = [
  {
    path: "",
    component: FamiliarsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamiliarsPageRoutingModule {}
