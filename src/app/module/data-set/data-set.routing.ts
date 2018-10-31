import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {AuthGuard} from "../../auth-guard.service";
import {DataSetComponent} from "./data-set.component";
import {DataSetCanDeactivate} from "./data-set-can-deactivate";
const DATA_SET:Routes = <Routes>[
  {
    path: '',
    component: DataSetComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DataSetCanDeactivate]
    // children: [
    //   {path: 'report/list', component: DataSetReportListComponent},
    //   {path: 'report/update', component: DataSetReportUpdateComponent},
    //   {path: 'report/update/:id', component: DataSetReportUpdateComponent},
    //   {path: 'model/update', component: DataSetModelComponent},
    //   {path: 'model/update/:id', component: DataSetModelComponent},
    //   {path: 'changelog', component: DataSetChangelogComponent},
    //   {path: '', redirectTo: 'report/list', pathMatch: 'full'}
    // ]
  }
];

export const ROUTERS_DATA_SET:ModuleWithProviders = RouterModule.forChild(DATA_SET);
