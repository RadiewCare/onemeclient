import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MutationsPage } from "./mutations.page";

const routes: Routes = [
  {
    path: "",
    component: MutationsPage
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
  },
  {
    path: "import",
    loadChildren: () =>
      import("./import/import.module").then((m) => m.ImportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MutationsPageRoutingModule {}
