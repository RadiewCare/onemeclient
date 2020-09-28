import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditAnalyticStudyPage } from './edit-analytic-study.page';

const routes: Routes = [
  {
    path: '',
    component: EditAnalyticStudyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAnalyticStudyPageRoutingModule {}
