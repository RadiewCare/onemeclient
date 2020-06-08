import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ReportsPage } from "./reports.page";

const routes: Routes = [
  {
    path: "",
    component: ReportsPage
  },
  {
    path: "create",
    loadChildren: () =>
      import("./create/create.module").then((m) => m.CreatePageModule)
  },
  {
    path: ":id",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsPageRoutingModule {}
