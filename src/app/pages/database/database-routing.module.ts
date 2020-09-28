import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DatabasePage } from "./database.page";

const routes: Routes = [
  {
    path: "",
    component: DatabasePage
  },
  {
    path: "analysis-elements",
    loadChildren: () =>
      import("./analysis-elements/analysis-elements.module").then(
        (m) => m.AnalysisElementsPageModule
      )
  },
  {
    path: "diseases",
    loadChildren: () =>
      import("./diseases/diseases.module").then((m) => m.DiseasesPageModule)
  },
  {
    path: "drug-elements",
    loadChildren: () =>
      import("./drug-elements/drug-elements.module").then(
        (m) => m.DrugElementsPageModule
      )
  },
  {
    path: "genetic-elements",
    loadChildren: () =>
      import("./genetic-elements/genetic-elements.module").then(
        (m) => m.GeneticElementsPageModule
      )
  },
  {
    path: "genetic-variants",
    loadChildren: () =>
      import("./genetic-variants/genetic-variants.module").then(
        (m) => m.GeneticVariantsPageModule
      )
  },
  {
    path: "image-tests",
    loadChildren: () =>
      import("./image-tests/image-tests.module").then(
        (m) => m.ImageTestsPageModule
      )
  },
  {
    path: "mutations",
    loadChildren: () =>
      import("./mutations/mutations.module").then((m) => m.MutationsPageModule)
  },
  {
    path: "phenotypic-elements",
    loadChildren: () =>
      import("./phenotypic-elements/phenotypic-elements.module").then(
        (m) => m.PhenotypicElementsPageModule
      )
  },
  {
    path: "polymorphisms",
    loadChildren: () =>
      import("./polymorphisms/polymorphisms.module").then(
        (m) => m.PolymorphismsPageModule
      )
  },
  {
    path: "symptoms",
    loadChildren: () =>
      import("./symptoms/symptoms.module").then((m) => m.SymptomsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabasePageRoutingModule {}
