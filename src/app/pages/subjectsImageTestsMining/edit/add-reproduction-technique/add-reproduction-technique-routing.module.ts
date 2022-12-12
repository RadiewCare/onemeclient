import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddReproductionTechniquePage } from './add-reproduction-technique.page';

const routes: Routes = [
  {
    path: '',
    component: AddReproductionTechniquePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddReproductionTechniquePageRoutingModule {}
