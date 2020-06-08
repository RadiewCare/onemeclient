import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DiseasesPage } from "./diseases.page";

const routes: Routes = [
  {
    path: "",
    component: DiseasesPage
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
    path: "edit/add-analysis-element",
    loadChildren: () =>
      import("./edit/add-analysis-element/add-analysis-element.module").then(
        (m) => m.AddAnalysisElementPageModule
      )
  },
  {
    path: "edit/add-epigenetic-element",
    loadChildren: () =>
      import(
        "./edit/add-epigenetic-element/add-epigenetic-element.module"
      ).then((m) => m.AddEpigeneticElementPageModule)
  },
  {
    path: "edit/add-genetic-element",
    loadChildren: () =>
      import("./edit/add-genetic-element/add-genetic-element.module").then(
        (m) => m.AddGeneticElementPageModule
      )
  },
  {
    path: "edit/add-image-test",
    loadChildren: () =>
      import("./edit/add-image-test/add-image-test.module").then(
        (m) => m.AddImageTestPageModule
      )
  },
  {
    path: "edit/add-mutation",
    loadChildren: () =>
      import("./edit/add-mutation/add-mutation.module").then(
        (m) => m.AddMutationPageModule
      )
  },
  {
    path: "edit/add-phenotypic-element",
    loadChildren: () =>
      import(
        "./edit/add-phenotypic-element/add-phenotypic-element.module"
      ).then((m) => m.AddPhenotypicElementPageModule)
  },
  {
    path: "edit/import",
    loadChildren: () =>
      import("./edit/import/import.module").then((m) => m.ImportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiseasesPageRoutingModule {}
