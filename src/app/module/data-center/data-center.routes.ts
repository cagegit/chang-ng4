import { DataSourceListComponent } from "./source/data-source-list.component";
import { DataSetListComponent } from "./set/data-set-list.component";
import { ConfigMenuComponent } from "./config/config-menu.component";
import { ConfigTableComponent } from "./config/config-table.component";
import { ConfigComponent } from './config/config.component';
import { DataSetComponent } from './set/data-set.component';
import { DashboardListComponent } from '../dashboard/dashboard-list.component';
export const routes = [
  {
    path: "",
    component: DataSetComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: "list/set/source", component: DataSourceListComponent },
      { path: "list/set", component: DataSetListComponent },
      { path: "list/set/dashboards", component: DashboardListComponent },
      { path: "list/set/id/:id", component: DataSetListComponent },
      // { path: "manifest/list", component: ManifestListComponent },
      // {
      //   path: "source/update/mysql",
      //   component: DataSourceUpdateMysqlComponent
      // },
      // {
      //   path: "source/update/mysql/:id",
      //   component: DataSourceUpdateMysqlComponent
      // },
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
      // },
      // { path: "", redirectTo: "config/menu", pathMatch: "full" }
    ]
  },  {
    path: "config",
    component: ConfigComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: "menu", component: ConfigMenuComponent },
      { path: "menu/table", component: ConfigTableComponent },
    ]
  }
];
