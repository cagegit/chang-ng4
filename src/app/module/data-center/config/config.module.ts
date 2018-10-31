import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { ConfigMenuComponent } from "./config-menu.component";
import { SharedModule } from "../../../common/module/shared.module";
import { ChangCommonModule } from "../../../changan/components/chang-common.module";
import { ConfigService } from "./config.service";
import { MenuDetailComponent } from "./menu-detail.component";
import { ConfigTableComponent } from './config-table.component';
import { TableDetailComponent } from './table-detail.component';
import { DataCenterModule } from '../data-center.module';
import { routes } from './config.routes';
import { DataCenterNavComponent } from '../data-center-nav.component';

@NgModule({
  imports: [
    // RouterModule.forChild(routes),
    SharedModule,
    NgZorroAntdModule.forRoot(),
    ChangCommonModule,
  ],
  declarations: [ConfigMenuComponent, MenuDetailComponent,ConfigTableComponent,TableDetailComponent,DataCenterNavComponent],
  providers: [ConfigService],
  exports: []
})
export class ConfigModule {}
