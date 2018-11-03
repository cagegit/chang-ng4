import {NgModule} from "@angular/core";
import {DragulaModule} from "ng2-dragula/ng2-dragula";
import {SharedModule} from "../../common/module/shared.module";
import {TableRelationModule} from "../relation/tableRelation.module";
import {TemplateComponent} from "./template.component";
import {TemplateListComponent} from "./template-list.component";
import {TemplateDataComponent} from "./template-data.component";
import {DataSetService} from "../../common/service/data-set.service";
import {DataSourceService} from "../../common/service/data-source.service";
import {DashboardTemplateService} from "../../common/service/dashboard-template.service";
import {RouterModule} from "@angular/router";
import {routes} from "./template.routes";
import {DashboardModule} from "../dashboard/dashboard.module";

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    TableRelationModule,
    DragulaModule,
    DashboardModule
  ],
  declarations: [
    TemplateComponent,
    TemplateListComponent,
    TemplateDataComponent
  ],
  providers : [
    DataSetService,
    DataSourceService,
    DashboardTemplateService
  ]
})
export class TemplateModule{

}
