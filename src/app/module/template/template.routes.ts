import {AuthGuard} from "../../auth-guard.service";
import {TemplateListComponent} from "./template-list.component";
import {TemplateComponent} from "./template.component";
import {TemplateDataComponent} from "./template-data.component";
export const routes = [
  {
    path: '',
    component: TemplateComponent,
    canActivate: [AuthGuard],
    children:[
      {path: 'dashboard/list', component: TemplateListComponent},
      {path:'dashboard/data/:dataSourceType/:dashboardID', component: TemplateDataComponent},
      {path: 'dashboard/:id', component: TemplateListComponent}
    ]
  }
];
