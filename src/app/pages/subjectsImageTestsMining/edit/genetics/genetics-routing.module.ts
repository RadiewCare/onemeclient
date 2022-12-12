import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneticsPage } from './genetics.page';

const routes: Routes = [
  {
    path: '',
    component: GeneticsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneticsPageRoutingModule {}
