import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPhenotypicElementPage } from './add-phenotypic-element.page';

const routes: Routes = [
  {
    path: '',
    component: AddPhenotypicElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPhenotypicElementPageRoutingModule {}
