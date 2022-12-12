import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FenotipicsPage } from './fenotipics.page';

const routes: Routes = [
  {
    path: '',
    component: FenotipicsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FenotipicsPageRoutingModule {}
