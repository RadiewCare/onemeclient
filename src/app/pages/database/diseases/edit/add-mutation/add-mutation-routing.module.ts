import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddMutationPage } from './add-mutation.page';

const routes: Routes = [
  {
    path: '',
    component: AddMutationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMutationPageRoutingModule {}
