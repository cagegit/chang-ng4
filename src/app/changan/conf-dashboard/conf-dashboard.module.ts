import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import { SharedModule } from '../../common/module/shared.module';
import { ChangService } from '../chang.service';
// import { ConfDashboardComponent } from './conf-dashboard.component';
// import { ConfDashboardRoutingModule } from './conf-dashboard.routing.module';
import { DashViewComponent } from './dash-view.component';
import { ConfMainComponent } from './conf-main.component';
import { NgxEchartsModule } from 'ngx-echarts';
import 'echarts/theme/macarons.js';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PanelEchartComponent } from './panel-echart.component';
@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    NgxEchartsModule,
    NgZorroAntdModule
  ],
  providers: [
    ChangService,
  ],
  declarations: [
    DashViewComponent,
    ConfMainComponent,
    PanelEchartComponent
  ],
  exports: [
    PanelEchartComponent
  ]
})
export class ConfDashboardModule { }
