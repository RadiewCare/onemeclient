import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditReproductionTestPage } from './edit-reproduction-test.page';

const routes: Routes = [
  {
    path: '',
    component: EditReproductionTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditReproductionTestPageRoutingModule {}
