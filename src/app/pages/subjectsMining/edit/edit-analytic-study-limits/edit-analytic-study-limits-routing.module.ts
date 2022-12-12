import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditAnalyticStudyLimitsPage } from './edit-analytic-study-limits.page';

const routes: Routes = [
  {
    path: '',
    component: EditAnalyticStudyLimitsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAnalyticStudyLimitsPageRoutingModule {}
