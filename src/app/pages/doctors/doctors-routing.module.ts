import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DoctorsPage } from "./doctors.page";

const routes: Routes = [
  {
    path: "",
    component: DoctorsPage
  },
  {
    path: "create/:id",
    loadChildren: () =>
      import("./create/create.module").then((m) => m.CreatePageModule)
  },
  {
    path: "edit/:id",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule)
  },
  {
    path: 'invitation',
    loadChildren: () => import('./invitation/invitation.module').then(m => m.InvitationPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsPageRoutingModule { }
