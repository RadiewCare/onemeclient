import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClinicAnalysisPage } from './clinic-analysis.page';

const routes: Routes = [
  {
    path: '',
    component: ClinicAnalysisPage
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./edit/edit.module').then(m => m.EditPageModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then(m => m.CreatePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClinicAnalysisPageRoutingModule { }
