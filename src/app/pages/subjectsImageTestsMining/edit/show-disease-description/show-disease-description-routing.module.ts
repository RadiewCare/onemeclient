import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowDiseaseDescriptionPage } from './show-disease-description.page';

const routes: Routes = [
  {
    path: '',
    component: ShowDiseaseDescriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowDiseaseDescriptionPageRoutingModule {}
