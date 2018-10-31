import {UmComponent} from "./um.component";
import {UmAuthComponent} from "./auth/um-auth.component";
import {UmUserComponent} from "./user/um-user.component";
import {UmGroupComponent} from "./group/um-group.component";
import {AuthGuard} from "../../auth-guard.service";

export const routes = [
  {
    path: '',
    component: UmComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'user', component: UmUserComponent},
      {path: 'user/:id', component: UmUserComponent},
      {path: 'group', component: UmGroupComponent},
      {path: 'group/:id', component: UmGroupComponent},
      {path: 'auth', component: UmAuthComponent},

      // {
      //   path : 'forward',
      //   loadChildren : './forward/forward.module#forwardModule',
      //   canLoad: [AuthGuard]
      // },
      {path: '', redirectTo: 'user', pathMatch: 'full'}
    ]
  }
];
