import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowEmbryoDetailsPage } from './show-embryo-details.page';

const routes: Routes = [
  {
    path: '',
    component: ShowEmbryoDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowEmbryoDetailsPageRoutingModule {}
