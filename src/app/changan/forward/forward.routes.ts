
import {ForwardConfigComponent} from "./forward-config.component";
import {ForwardComponent} from "./forward.component";
import {TaskComponent} from "./task.component";
import {AuthGuard} from "../../auth-guard.service";

export const routes = [
  {
    path: '',
    component: ForwardComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'forward', component: ForwardConfigComponent},
      {path: 'forward-config', component: ForwardConfigComponent},
      {path: 'task', component: TaskComponent},
      {path: '', redirectTo: 'forward-config', pathMatch: 'full'}
    ]
  }
];
