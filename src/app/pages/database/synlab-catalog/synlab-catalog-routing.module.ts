import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SynlabCatalogPage } from './synlab-catalog.page';

const routes: Routes = [
  {
    path: '',
    component: SynlabCatalogPage
  },
  {
    path: 'import',
    loadChildren: () => import('./import/import.module').then( m => m.ImportPageModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SynlabCatalogPageRoutingModule {}
