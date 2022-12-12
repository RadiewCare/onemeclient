import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditQuibimPage } from './edit-quibim.page';

const routes: Routes = [
  {
    path: '',
    component: EditQuibimPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditQuibimPageRoutingModule {}
