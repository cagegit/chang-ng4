import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { authProviders } from "./login/login.routing";
import { CanDeactivateGuard } from "./can-deactivate-guard.service";
import { AuthGuard } from "./auth-guard.service";
import { HomeComponent } from "./home/home.component";
import { TenantComponent } from "./tenant/TenantComponent";
import { LoginDomainComponent } from "./login/login-domain.component";
import { LoginComponent } from "./login/login.component";
import { MessageListComponent } from "./message/message-list.component";
import { RegSetPasswordComponent } from "./module/reg/reg-set-password.component";
import { ErrorPageComponent } from "./error/error-page.component";
import { ContactComponent } from "./contact/contact.component";
import { WelcomeComponent } from "./module/welcome/welcome.component";
import { RegInComponent } from "./module/reg/reg-in.component";
import { LayoutDefaultComponent } from "./layout/default/default.component";
import { ChanganLayoutComponent } from "./layout/changan/changan-layout.component";
import { DataCenterComponent } from "./module/data-center/data-center.component";
import { DataSourceUpdateMysqlComponent } from "./module/data-center/source/mysql/data-source-update-mysql.component";
import { DataSourceUpdateCodeComponent } from './module/data-center/source/code/data-source-update-code.component';
import { DataSourceUpdateJiraComponent } from './module/data-center/source/jira/data-source-update-jira.component';
import { DataSetUpdateComponent } from './module/data-center/set/data-set-update.component';
import { LoginLocalComponent } from './login/login-local.component';
import { CarSearchComponent } from './changan/car-activity/car-search.component';

//公共路由
export const ROUTES_COMMON: Routes = [
  { path: "", redirectTo: "local", pathMatch: "full" }
  //{ path:'login',loadChildren:() => System.import('./+login/login.module')}
];

//用户管理
const umRoutes: Routes = [
  {
    path: "dashboard",
    loadChildren: "./module/dashboard/dashboard.module#DashboardModule",
    canLoad: [AuthGuard]
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: "message",
    component: MessageListComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: "um",
    loadChildren: "./module/um/um.module#UmModule",
    canLoad: [AuthGuard]
  },
  {
    path: "tenant",
    component: TenantComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: "data_center",
    loadChildren: "./module/data-center/data-center.module#DataCenterModule",
    canLoad: [AuthGuard]
  },
  {
    path: "data_set/:id/:tab",
    loadChildren: "./module/data-set/data-set.module#DataSetModule",
    canLoad: [AuthGuard]
  },
  {
    path: "card",
    loadChildren: "./module/card/card.module#CardModule",
    canLoad: [AuthGuard]
  },
  {
    path: "template",
    loadChildren: "./module/template/template.module#TemplateModule",
    canLoad: [AuthGuard]
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "login_domain",
    component: LoginDomainComponent
  },
  {
    path: "setpassword",
    component: RegSetPasswordComponent
  },
  {
    path: "contact",
    component: ContactComponent
  },
  {
    path: "welcome",
    component: WelcomeComponent
  },
  {
    path: "introduce",
    component: RegInComponent
  },
  {
    path: "error",
    component: ErrorPageComponent
  },
  {
    path: "**",
    component: ErrorPageComponent
  }
];

const newRoutes: Routes = [
  {
    path: "local",
    component: LoginLocalComponent
  },
  {
    path: '',
    component: ChanganLayoutComponent,
    children: [
      {
        path: "welcome",
        redirectTo: "welcome",
        pathMatch: "full"
      },
      {
        path: "dashboard",
        loadChildren: "./module/dashboard/dashboard.module#DashboardModule"
      },
      {
        path: "home",
        component: HomeComponent,
        canActivate: [AuthGuard],
        canLoad: [AuthGuard]
      },
      {
        path: "message",
        component: MessageListComponent,
        canActivate: [AuthGuard],
        canLoad: [AuthGuard]
      },
      {
        path: "um",
        loadChildren: "./module/um/um.module#UmModule",
        canLoad: [AuthGuard]
      },
      {
        path: "tenant",
        component: TenantComponent,
        canActivate: [AuthGuard],
        canLoad: [AuthGuard]
      },
      {
        path: "data_center",
        loadChildren:
          "./module/data-center/data-center.module#DataCenterModule",
        canLoad: [AuthGuard]
      },
      {
        path: "data_set/:id/:tab",
        loadChildren: "./module/data-set/data-set.module#DataSetModule",
        canLoad: [AuthGuard]
      },
      {
        path: "card",
        loadChildren: "./module/card/card.module#CardModule"
      },
      {
        path: "template",
        loadChildren: "./module/template/template.module#TemplateModule",
        canLoad: [AuthGuard]
      },
      {
        path: "login",
        component: LoginComponent
      },
      {
        path: "login_domain",
        component: LoginDomainComponent
      },
      {
        path: "setpassword",
        component: RegSetPasswordComponent
      },
      {
        path: "contact",
        component: ContactComponent
      },
      {
        path: "welcome",
        component: WelcomeComponent
      }
    ]
  },
  {
    path: "chang",
    component: ChanganLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: "./changan/chang.module#ChangModule"
      },
      {
        path: "conf-dashboard",
        loadChildren:
          "./changan/conf-dashboard/conf-dashboard.module#ConfDashboardModule"
      },
      {
        path: "data-center",
        loadChildren: "./module/data-center/data-center.module#DataCenterModule"
      },
      {
        path: "source/update/mysql",
        component: DataSourceUpdateMysqlComponent
      },
      {
        path: "source/update/mysql/:id",
        component: DataSourceUpdateMysqlComponent
      },
      {
        path: "source/update/impala",
        component: DataSourceUpdateMysqlComponent
      },
      {
        path: "source/update/impala/:id",
        component: DataSourceUpdateMysqlComponent
      },
      { path: "set/update", component: DataSetUpdateComponent },
      { path: "set/update/:id", component: DataSetUpdateComponent },
      {
        path: "data_set/:id/:tab",
        loadChildren: "./module/data-set/data-set.module#DataSetModule",
        // canLoad: [AuthGuard]
      },
      {
        path: "card",
        loadChildren: "./module/card/card.module#CardModule",
        // canLoad: [AuthGuard]
      },
      {
        path: "active/search",
        component: CarSearchComponent
      },
      // {
      //   path: "source/update/kylin",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/kylin/:id",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/hive2",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/hive2/:id",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/spark",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/spark/:id",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // { path: "source/update/code", component: DataSourceUpdateCodeComponent },
      // {
      //   path: "source/update/code/:id",
      //   component: DataSourceUpdateCodeComponent
      // },
      // {
      //   path: "source/update/isource",
      //   component: DataSourceUpdateCodeComponent
      // },
      // {
      //   path: "source/update/isource/:id",
      //   component: DataSourceUpdateCodeComponent
      // },
      // { path: "source/update/jira", component: DataSourceUpdateJiraComponent },
      // {
      //   path: "source/update/jira/:id",
      //   component: DataSourceUpdateJiraComponent
      // }
    ]
  },
  {
    path: "introduce",
    component: RegInComponent
  },
  {
    path: "error",
    component: ErrorPageComponent
  },
  {
    path: "**",
    component: ErrorPageComponent
  }
];

//APP应用级别路由
const appRoutes: Routes = [...ROUTES_COMMON, ...newRoutes];

export const appRoutingProviders: any[] = [authProviders, CanDeactivateGuard];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
