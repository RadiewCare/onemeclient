import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { EditPage } from "./edit.page";
import { IonicSelectableModule } from "ionic-selectable";
import { AddGeneticElementPage } from "./add-genetic-element/add-genetic-element.page";
import { AddAnalysisElementPage } from "./add-analysis-element/add-analysis-element.page";
import { AddImageTestPage } from "./add-image-test/add-image-test.page";
import { AddMutationPage } from "./add-mutation/add-mutation.page";
import { AddEpigeneticElementPage } from "./add-epigenetic-element/add-epigenetic-element.page";
import { AddPhenotypicElementPage } from "./add-phenotypic-element/add-phenotypic-element.page";
import { ImportPage } from "./import/import.page";

const routes: Routes = [
  {
    path: "",
    component: EditPage
  }
];

@NgModule({
  entryComponents: [
    AddGeneticElementPage,
    AddAnalysisElementPage,
    AddImageTestPage,
    AddMutationPage,
    AddEpigeneticElementPage,
    AddPhenotypicElementPage,
    ImportPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    IonicSelectableModule
  ],
  declarations: [
    EditPage,
    AddGeneticElementPage,
    AddAnalysisElementPage,
    AddImageTestPage,
    AddMutationPage,
    AddEpigeneticElementPage,
    AddPhenotypicElementPage,
    ImportPage
  ]
})
export class EditPageModule {}
