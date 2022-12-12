import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RadiologyPage } from './radiology.page';

const routes: Routes = [
  {
    path: '',
    component: RadiologyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RadiologyPageRoutingModule {}
