import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddAnalyticStudyPage } from './add-analytic-study.page';

const routes: Routes = [
  {
    path: '',
    component: AddAnalyticStudyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddAnalyticStudyPageRoutingModule {}
