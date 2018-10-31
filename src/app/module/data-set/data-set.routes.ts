import {AuthGuard} from "../../auth-guard.service";
import {DataSetComponent} from "./data-set.component";
import {DataSetCanDeactivate} from "./data-set-can-deactivate";
export const routes = [
  {
    path: '',
    component: DataSetComponent,
    // canActivate: [AuthGuard],
    // canDeactivate: [DataSetCanDeactivate]
  }
];
