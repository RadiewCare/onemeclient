import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./pages/dashboard/dashboard.module").then(
        (m) => m.DashboardPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "database",
    loadChildren: () =>
      import("./pages/database/database.module").then(
        (m) => m.DatabasePageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "doctors",
    loadChildren: () =>
      import("./pages/doctors/doctors.module").then((m) => m.DoctorsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: "documentation",
    loadChildren: () =>
      import("./pages/documentation/documentation.module").then(
        (m) => m.DocumentationPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "login",
    loadChildren: () =>
      import("./pages/login/login.module").then((m) => m.LoginPageModule)
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./pages/profile/profile.module").then((m) => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: "register/:id",
    loadChildren: () =>
      import("./pages/register/register.module").then(
        (m) => m.RegisterPageModule
      )
  },
  {
    path: "reports",
    loadChildren: () =>
      import("./pages/reports/reports.module").then((m) => m.ReportsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: "statistics",
    loadChildren: () =>
      import("./pages/statistics/statistics.module").then(
        (m) => m.StatisticsPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "subjects",
    loadChildren: () =>
      import("./pages/subjects/subjects.module").then(
        (m) => m.SubjectsPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "subjects/:id",
    loadChildren: () =>
      import("./pages/subjects/subjects.module").then(
        (m) => m.SubjectsPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "tables",
    loadChildren: () =>
      import("./pages/tables/tables.module").then((m) => m.TablesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: "templates",
    loadChildren: () =>
      import("./pages/templates/templates.module").then(
        (m) => m.TemplatesPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "notifications",
    loadChildren: () =>
      import("./components/notifications/notifications.module").then(
        (m) => m.NotificationsPageModule
      )
  },
  {
    path: 'clinics',
    loadChildren: () => import('./pages/clinics/clinics.module').then(m => m.ClinicsPageModule)
  },
  {
    path: 'activity/:id',
    loadChildren: () => import('./pages/activity/activity.module').then(m => m.ActivityPageModule)
  },
  {
    path: "subjectsMining",
    loadChildren: () =>
      import("./pages/subjectsMining/subjectsMining.module").then(
        (m) => m.SubjectsMiningPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "subjectsMining/:id",
    loadChildren: () =>
      import("./pages/subjectsMining/subjectsMining.module").then(
        (m) => m.SubjectsMiningPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "subjectsImageTestsMining",
    loadChildren: () =>
      import("./pages/subjectsImageTestsMining/subjectsImageTestsMining.module").then(
        (m) => m.SubjectsImageTestsMiningPageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: "subjectsImageTestsMining/:id",
    loadChildren: () =>
      import("./pages/subjectsImageTestsMining/subjectsImageTestsMining.module").then(
        (m) => m.SubjectsImageTestsMiningPageModule
      ),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
