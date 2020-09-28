import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SubjectsPage } from "./subjects.page";

const routes: Routes = [
  {
    path: "",
    component: SubjectsPage
  },
  {
    path: "edit/:id",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule)
  },
  {
    path: "create",
    loadChildren: () =>
      import("./create/create.module").then((m) => m.CreatePageModule)
  },
  {
    path: "familiars/:id",
    loadChildren: () =>
      import("./familiars/familiars.module").then((m) => m.FamiliarsPageModule)
  },
  {
    path: "familiars/create/:id",
    loadChildren: () =>
      import("./familiars/create/create.module").then((m) => m.CreatePageModule)
  },
  {
    path: "familiars/edit/:id",
    loadChildren: () =>
      import("./familiars/edit/edit.module").then((m) => m.EditPageModule)
  },
  {
    path: "import/:id",
    loadChildren: () =>
      import("./import/import.module").then((m) => m.ImportPageModule)
  },
  {
    path: "share/:id",
    loadChildren: () =>
      import("./share/share.module").then((m) => m.SharePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubjectsPageRoutingModule {}
