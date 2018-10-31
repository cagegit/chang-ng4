import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfDashboardComponent } from './conf-dashboard.component';
const routes: Routes = [
  {
    path:'',
    children: [
      {
        path:'conf',component: ConfDashboardComponent
      },
      {
        path:'conf/:id',component: ConfDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class ConfDashboardRoutingModule { }
