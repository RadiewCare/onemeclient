import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddGeneticElementPage } from './add-genetic-element.page';

const routes: Routes = [
  {
    path: '',
    component: AddGeneticElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddGeneticElementPageRoutingModule {}
