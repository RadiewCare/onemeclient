import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowAnalysisDescriptionPage } from './show-analysis-description.page';

const routes: Routes = [
  {
    path: '',
    component: ShowAnalysisDescriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowAnalysisDescriptionPageRoutingModule {}
