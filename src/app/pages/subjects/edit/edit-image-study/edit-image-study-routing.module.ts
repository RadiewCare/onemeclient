import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditImageStudyPage } from './edit-image-study.page';

const routes: Routes = [
  {
    path: '',
    component: EditImageStudyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditImageStudyPageRoutingModule {}
