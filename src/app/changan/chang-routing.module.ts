// import { DataCenterModule } from '../module/data-center/data-center.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CarZfComponent} from "./car/car-zf.component";
import {CarLogComponent} from "./car/car-log.component";
import { ProtocolConfigComponent } from "./protocol/protocol-config.component";
import {ForwardConfigComponent} from "./forward/forward-config.component";
import {TaskComponent} from "./forward/task.component";
import {ChangAnComponent} from "./chang-an.component";
import {CanLeaveZf} from "./car/can-leave-zf";
import { CarSearchComponent } from './car-activity/car-search.component';


const routes: Routes = [
  {
    path: 'car',
    component: ChangAnComponent,
    children: [
      { path: 'tasks', component: TaskComponent },
      { path: 'transmit', component: CarZfComponent,canDeactivate:[CanLeaveZf] },
      { path: 'setting', component: ForwardConfigComponent },
      { path: 'log', component: CarLogComponent },
      { path: 'protocol', component: ProtocolConfigComponent },
      // { path: 'search', component: CarSearchComponent },
    ]
  },
  // { path: 'active/search', component: CarSearchComponent },
  // {
  //   path:'',redirectTo:'/chang/car/tasks',pathMatch:'full'
  // },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class ChangRoutingModule { }
