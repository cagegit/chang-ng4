import {Routes} from "@angular/router";
import {AuthGuard} from "./auth-guard.service";
import {HomeComponent} from "./home/home.component";
import {TenantComponent} from "./tenant/TenantComponent";
import {LoginDomainComponent} from "./login/login-domain.component";
import {LoginComponent} from "./login/login.component";
import {MessageListComponent} from "./message/message-list.component";
import {RegSetPasswordComponent} from "./module/reg/reg-set-password.component";
import {ErrorPageComponent} from "./error/error-page.component";

export const ROUTES: Routes = [
/*  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'detail', loadChildren: './+detail#DetailModule'},
  { path: 'barrel', loadChildren: './+barrel#BarrelModule'},
  { path: '**',    component: NoContentComponent },*/
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'message', component: MessageListComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'um',
    loadChildren: () => System.import('./module/um/um.module'),
    canLoad: [AuthGuard]
  },
  {
    path: 'tenant', component: TenantComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },{
    path : 'data_center',
    loadChildren: () => System.import('./module/data-center/data-center.module'),
    canLoad: [AuthGuard]
  },{
    path : 'data_set/:id/:tab',
    loadChildren: () => System.import('./module/data-set/data-set.module'),
    canLoad: [AuthGuard]
  },
  {
    path : 'card',
    loadChildren: () => System.import('./module/card/card.module'),
    canLoad: [AuthGuard]
  },
  {
    path : 'template',
    loadChildren: () => System.import('./module/template/template.module'),
    canLoad: [AuthGuard]
  },
  {
    path : 'dashboard',
    loadChildren: () => System.import('./module/dashboard/dashboard.module'),
    canLoad: [AuthGuard]
  },
  {
    path: 'login',component: LoginComponent
  },
  {
    path: 'login_domain',component: LoginDomainComponent
  },
  {
    path: 'setpassword',component: RegSetPasswordComponent
  },
  {
    path: 'error',component: ErrorPageComponent
  },
  {
    path: '**',component: ErrorPageComponent
  }
];
