/**
 * Created by fengjj on 2016/9/19.
 */
import { ModuleWithProviders } from '@angular/core';
import { RouterModule , Routes }        from '@angular/router';

import { RegComponent }    from './reg.component';
import { RegSetPasswordComponent } from './reg-set-password.component';
import { RegInComponent } from './reg-in.component'
import { RegSetDomainComponent } from './reg-set-domain.component';
import { RegOkComponent } from  './reg-ok.component';
import {InvalidComponent} from "./invalid.component";
import {ResendSuccessComponent} from "./resend-success.component";
const r:Routes = <Routes>[
  {
    path: 'main',
    component: RegComponent,
    children: [
      {
        path: 'setdomain/:id',
        component: RegSetDomainComponent
      },
      {
        path: 'complete',
        component: RegOkComponent
      },
      {
        path: 'invalid',
        component: InvalidComponent
      },
      {
        path:'resend_success',
        component:ResendSuccessComponent
      },
      {
        path: '',
        component: RegInComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(r);

