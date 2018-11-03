// import { NgModule } from "@angular/core";
// import { Routes, RouterModule } from "@angular/router";
// import { ConfigMenuComponent } from "./config/config-menu.component";
// import { ConfigTableComponent } from "./config/config-table.component";
// import { ConfigComponent } from './config.component';
import { AuthGuard } from "../../auth-guard.service";
import { ConfigMenuComponent } from './config-menu.component';
import { ConfigTableComponent } from './config-table.component';
import { DataCenterComponent } from '../data-center.component';
export const routes = [
  {
    path: "",
    component: DataCenterComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: "config/menu", component: ConfigMenuComponent},
      { path: "config/table", component: ConfigTableComponent },
    ]
  }
];
