import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablesPage } from './tables.page';

const routes: Routes = [
  {
    path: '',
    component: TablesPage
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then( m => m.EditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablesPageRoutingModule {}
