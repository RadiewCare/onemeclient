import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditPage } from './edit.page';

const routes: Routes = [
  {
    path: '',
    component: EditPage
  },
  {
    path: 'add-image',
    loadChildren: () => import('./add-image/add-image.module').then( m => m.AddImagePageModule)
  },
  {
    path: 'gallery',
    loadChildren: () => import('./gallery/gallery.module').then( m => m.GalleryPageModule)
  },
  {
    path: 'add-analytic-study',
    loadChildren: () => import('./add-analytic-study/add-analytic-study.module').then( m => m.AddAnalyticStudyPageModule)
  },
  {
    path: 'add-image-study',
    loadChildren: () => import('./add-image-study/add-image-study.module').then( m => m.AddImageStudyPageModule)
  },
  {
    path: 'edit-analytic-study',
    loadChildren: () => import('./edit-analytic-study/edit-analytic-study.module').then( m => m.EditAnalyticStudyPageModule)
  },
  {
    path: 'edit-image-study',
    loadChildren: () => import('./edit-image-study/edit-image-study.module').then( m => m.EditImageStudyPageModule)
  },
  {
    path: 'edit-quibim',
    loadChildren: () => import('./edit-quibim/edit-quibim.module').then( m => m.EditQuibimPageModule)
  },
  {
    path: 'create-report',
    loadChildren: () => import('./create-report/create-report.module').then( m => m.CreateReportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPageRoutingModule {}
