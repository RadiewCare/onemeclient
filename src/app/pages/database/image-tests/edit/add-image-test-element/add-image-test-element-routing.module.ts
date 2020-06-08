import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddImageTestElementPage } from './add-image-test-element.page';

const routes: Routes = [
  {
    path: '',
    component: AddImageTestElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddImageTestElementPageRoutingModule {}
