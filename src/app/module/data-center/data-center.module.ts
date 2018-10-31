import {NgModule} from "@angular/core";
import {DataCenterComponent} from "./data-center.component";
import {ROUTERS_DATA_CENTER} from "./data-center.routing";
import {DataSourceListComponent} from "./source/data-source-list.component";
import {DataSourceUpdateMysqlComponent} from "./source/mysql/data-source-update-mysql.component";
import {SharedModule} from "../../common/module/shared.module";
import {DataSetListComponent} from "./set/data-set-list.component";
import {DataSetUpdateComponent} from "./set/data-set-update.component";
import {ShowDataComponent} from "./set/show-data.component";
// import {DataSourceService} from "../../common/service/data-source.service";
import {DataSourceUpdateCodeComponent} from "./source/code/data-source-update-code.component";
import {DataSourceUpdateJiraComponent} from "./source/jira/data-source-update-jira.component";
// import {DataSetService} from "../../common/service/data-set.service";
import {DataSourceAddModalComponent} from "./source/data-source-add.component";
import TableRelationModule from "../relation/tableRelation.module";
import {BranchSelectComponent} from "./source/code/branch-select.component";
import {ManifestListComponent} from "./manifest/manifest-list.component";
import {ManifestUploadComponent} from "./manifest/manifest-upload.component";
import {ManifestUpdateComponent} from "./manifest/manifest-update.component";
import {ManifestAddComponent} from "./manifest/manifest-add.component";
import {ManifestService} from "../../common/service/manifest.service";
import {DataCenterNavComponent} from "./data-center-nav.component";
import {RouterModule} from "@angular/router";
import {routes} from "./data-center.routes";
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {ConfigComponent} from './config/config.component';
import { DataSetComponent } from './set/data-set.component';
import { DataSetService } from './set/data-set.service';
import { ConfigMenuComponent } from './config/config-menu.component';
import { ConfigTableComponent } from './config/config-table.component';
import { DataSourceService } from './source/data-source.service';
import { DataFullPageComponent } from './data-fullpage.component';
import { MenuDetailComponent } from './config/menu-detail.component';
import { TableDetailComponent } from './config/table-detail.component';
import { ConfigService } from './config/config.service';
// import { DashboardListComponent } from '../dashboard/dashboard-list.component';
import { DashboardService } from '../dashboard/dashboard.service';
import { DashboardModule } from '../dashboard/dashboard.module';
import { DataCardService } from '../data-set/data-card.service';
import { ConfDashboardModule } from '../../changan/conf-dashboard/conf-dashboard.module';

@NgModule({
  imports: [
    SharedModule,
    TableRelationModule,
    DashboardModule,
    RouterModule.forChild(routes),
    NgZorroAntdModule.forRoot(),
    ConfDashboardModule
  ],
  declarations: [
    DataCenterComponent,
    ConfigComponent,
    DataSetComponent,
    DataFullPageComponent,
    ConfigMenuComponent, MenuDetailComponent,ConfigTableComponent,TableDetailComponent,
    DataSourceListComponent,
    DataSourceAddModalComponent,
    DataSourceUpdateMysqlComponent,
    DataSetListComponent,
    DataSetUpdateComponent,
    DataSourceUpdateCodeComponent,
    BranchSelectComponent,
    DataSourceUpdateJiraComponent,
    ShowDataComponent,
    ManifestListComponent,
    ManifestUploadComponent,
    ManifestUpdateComponent,
    ManifestAddComponent,
    DataCenterNavComponent
  ],
  providers : [
    DataSetService,
    ManifestService,
    DataSourceService,
    ConfigService,
    DashboardService,
    DataCardService
  ]
})
export class DataCenterModule{
  public static routes = routes;
}
