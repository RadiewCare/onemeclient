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
    path: "register",
    loadChildren: () =>
      import("./pages/register/register.module").then(
        (m) => m.RegisterPageModule
      ),
    canActivate: [AuthGuard]
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
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
