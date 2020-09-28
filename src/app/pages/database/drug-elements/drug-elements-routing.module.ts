import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrugElementsPage } from './drug-elements.page';

const routes: Routes = [
  {
    path: '',
    component: DrugElementsPage
  },
  {
    path: 'import',
    loadChildren: () => import('./import/import.module').then( m => m.ImportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrugElementsPageRoutingModule {}
