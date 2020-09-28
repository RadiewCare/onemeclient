import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEpigeneticElementPage } from './add-epigenetic-element.page';

const routes: Routes = [
  {
    path: '',
    component: AddEpigeneticElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddEpigeneticElementPageRoutingModule {}
