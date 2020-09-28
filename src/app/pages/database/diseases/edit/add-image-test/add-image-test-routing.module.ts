import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddImageTestPage } from './add-image-test.page';

const routes: Routes = [
  {
    path: '',
    component: AddImageTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddImageTestPageRoutingModule {}
