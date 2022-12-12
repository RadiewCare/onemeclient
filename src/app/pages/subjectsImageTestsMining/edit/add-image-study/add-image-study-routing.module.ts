import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddImageStudyPage } from './add-image-study.page';

const routes: Routes = [
  {
    path: '',
    component: AddImageStudyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddImageStudyPageRoutingModule {}
