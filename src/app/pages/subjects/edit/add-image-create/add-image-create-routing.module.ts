import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddImageCreatePage } from './add-image-create.page';

const routes: Routes = [
  {
    path: '',
    component: AddImageCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddImageCreatePageRoutingModule {}
