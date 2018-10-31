import {DashboardComponent} from "./dashboard.component";
import {DashboardPreviewComponent} from "./dashboard-preview.component";
import {DashboardListComponent} from "./dashboard-list.component";
import { ConfDashComponent } from './conf-dash.component';
import { DashboardDefaultComponent } from './dashboard-default.component';

export const routes = [
  { path: 'info',
    children: [
    {path: 'list', component: DashboardListComponent},
    {path: 'update', component: DashboardComponent},
    {path: 'update/:id', component: DashboardComponent},
    {path: 'config', component: ConfDashComponent},
    {path: 'config/:id', component: ConfDashComponent},
    {path: 'default', component: DashboardDefaultComponent},
    {path: ':id', component: DashboardPreviewComponent}
  ]}
];
