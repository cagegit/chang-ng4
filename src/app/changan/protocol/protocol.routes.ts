
import {ProtocolConfigComponent} from "./protocol-config.component";
import {ProtocolComponent} from "./protocol.component";
import {AuthGuard} from "../../auth-guard.service";

export const routes = [
  {
    path: '',
    component: ProtocolComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'protocol', component: ProtocolConfigComponent},
      {path: 'protocol-config', component: ProtocolConfigComponent},
      {path: '', redirectTo: 'protocol-config', pathMatch: 'full'}
    ]
  }
];
