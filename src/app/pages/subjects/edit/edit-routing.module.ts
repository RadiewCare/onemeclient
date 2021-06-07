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
  },
  {
    path: 'add-reproduction-technique',
    loadChildren: () => import('./add-reproduction-technique/add-reproduction-technique.module').then( m => m.AddReproductionTechniquePageModule)
  },
  {
    path: 'show-embryo-details',
    loadChildren: () => import('./show-embryo-details/show-embryo-details.module').then( m => m.ShowEmbryoDetailsPageModule)
  },
  {
    path: 'edit-reproduction-test',
    loadChildren: () => import('./edit-reproduction-test/edit-reproduction-test.module').then( m => m.EditReproductionTestPageModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then( m => m.AnalyticsPageModule)
  },
  {
    path: 'genetics',
    loadChildren: () => import('./genetics/genetics.module').then( m => m.GeneticsPageModule)
  },
  {
    path: 'fenotipics',
    loadChildren: () => import('./fenotipics/fenotipics.module').then( m => m.FenotipicsPageModule)
  },
  {
    path: 'radiology',
    loadChildren: () => import('./radiology/radiology.module').then( m => m.RadiologyPageModule)
  },
  {
    path: 'show-analysis-description',
    loadChildren: () => import('./show-analysis-description/show-analysis-description.module').then( m => m.ShowAnalysisDescriptionPageModule)
  },
  {
    path: 'show-disease-description',
    loadChildren: () => import('./show-disease-description/show-disease-description.module').then( m => m.ShowDiseaseDescriptionPageModule)
  },
  {
    path: 'edit-analytic-study-limits',
    loadChildren: () => import('./edit-analytic-study-limits/edit-analytic-study-limits.module').then( m => m.EditAnalyticStudyLimitsPageModule)
  },
  {
    path: 'add-image-create',
    loadChildren: () => import('./add-image-create/add-image-create.module').then( m => m.AddImageCreatePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPageRoutingModule {}
