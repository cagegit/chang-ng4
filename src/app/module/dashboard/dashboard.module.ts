import {NgModule} from "@angular/core";
import {SharedModule} from "../../common/module/shared.module";
import {RouterModule} from "@angular/router";
import {routes} from "./dashboard.routing";
import {DashboardPreviewComponent} from "./dashboard-preview.component";
import {CardService} from "../../common/service/card.service";
import {DragulaModule, DragulaService} from "ng2-dragula";
import {DashboardTemplateService} from "../../common/service/dashboard-template.service";
import {CommonPreviewComponent} from "./common-preview.component";
import TableRelationModule from "../relation/tableRelation.module";
import {NgGridModule} from "angular2-grid";
import {DashboardComponent} from "./dashboard.component";
import {DashboardListComponent} from "./dashboard-list.component";
import {PaneTypeComponet} from "./panel-type.componet";
import {PageLayoutComponent} from "./page-layout.component";
import {PanelInitComponent} from "./panel-init.component";
import {PanelFilterComponent} from "./panel-filter.component";
import {PreviewFilterComponent} from "./preview-filter.component";
import {HtmlParse} from "../../common/pipe/htmlParse.pipe";
import {SetOperateComponent} from "./set-operate.component";
import {PreviewFilterMemberComponent} from "./preview-filter-member.component";
import {SortableModule} from "ng2-bootstrap";
import { ConfDashComponent } from './conf-dash.component';
import { ChangService } from '../../changan/chang.service';
import { ConfDashboardModule } from '../../changan/conf-dashboard/conf-dashboard.module';
import { DashboardDefaultComponent } from './dashboard-default.component';

@NgModule({
  imports: [
    SharedModule,
    DragulaModule,
    TableRelationModule,
    NgGridModule,
    ConfDashboardModule,
    RouterModule.forChild(routes),
    SortableModule.forRoot()
  ],
  declarations: [
    DashboardPreviewComponent,
    CommonPreviewComponent,
    DashboardComponent,
    DashboardListComponent,
    PaneTypeComponet,
    PageLayoutComponent,
    PanelInitComponent,
    PanelFilterComponent,
    PreviewFilterComponent,
    HtmlParse,
    SetOperateComponent,
    PreviewFilterMemberComponent,
    ConfDashComponent,
    DashboardDefaultComponent
  ],
  providers : [
    DragulaService,
    CardService,
    DashboardTemplateService,
    ChangService
  ],
  exports:[CommonPreviewComponent,DashboardListComponent]
})
export class DashboardModule{
  public static routes = routes;
}
