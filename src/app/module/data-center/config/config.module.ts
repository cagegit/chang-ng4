import { NgModule } from "@angular/core";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { ConfigMenuComponent } from "./config-menu.component";
import { SharedModule } from "../../../common/module/shared.module";
import { ChangCommonModule } from "../../../changan/components/chang-common.module";
import { ConfigService } from "./config.service";
import { MenuDetailComponent } from "./menu-detail.component";
import { ConfigTableComponent } from './config-table.component';
import { TableDetailComponent } from './table-detail.component';
import { DataCenterNavComponent } from '../data-center-nav.component';
import { ConfDashboardModule } from '../../../changan/conf-dashboard/conf-dashboard.module';
import { RouterModule} from '@angular/router';

@NgModule({
  imports: [
    // RouterModule.forChild(routes),
    SharedModule,
    NgZorroAntdModule.forRoot(),
    ChangCommonModule,
    ConfDashboardModule,
    RouterModule
  ],
  declarations: [
    ConfigMenuComponent,
    MenuDetailComponent,
    ConfigTableComponent,
    TableDetailComponent,
    DataCenterNavComponent
  ],
  providers: [ConfigService],
  exports: [
    ConfigMenuComponent,
    MenuDetailComponent,
    TableDetailComponent,
    ConfigTableComponent,
    DataCenterNavComponent
  ]
})
export class ConfigModule {}
