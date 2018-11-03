import {NgModule} from "@angular/core";
import {DragulaModule} from "ng2-dragula/ng2-dragula";
import {DataSetComponent} from "./data-set.component";
import {DataSetCardListComponent} from "./card/data-set-card-list.component";
import {DataSetChangelogComponent} from "./changelog/data-set-changelog.component";
import {DataSetService} from "../../common/service/data-set.service";
import {DataSetSchemaComponent} from "./schema/data-set-schema.component";
import {DataSourceService} from "../../common/service/data-source.service";
import {SharedModule} from "../../common/module/shared.module";
import {TableRelationModule} from "../relation/tableRelation.module";
import  { EditDimensionCompnent } from './schema/edit-dimension.component';
import { EditFactCompnent } from './schema/edit-fact.component';
import {CardService} from "../../common/service/card.service";
import {SchemaHandleComponent} from "./schema/schema-handle.component";
import {DataSetQueryComponent} from "./query/data-set-query.component";
import {DataSourceKylinQueryService} from "../../common/service/data-source-kylin-query.service";
import {MyEditorComponent} from "./query/my-editor.component";
import {SetCronComponent} from "./set-cron.component";
import {DataSetAlertComponent} from "./data-set-alert.component";
import {StateStepComponet} from "./schema/state-step.component";
import {DataSetCanDeactivate} from "./data-set-can-deactivate";
import {CardSummaryComponent} from "./card/card.summary.component";
import {RouterModule} from "@angular/router";
import {routes} from "./data-set.routes";
@NgModule({
  imports: [
    SharedModule,
    TableRelationModule,
    RouterModule.forChild(routes),
    DragulaModule
  ],
  declarations: [
    DataSetComponent,
    DataSetSchemaComponent,
    DataSetCardListComponent,
    DataSetChangelogComponent,
    EditDimensionCompnent,
    EditFactCompnent,
    SchemaHandleComponent,
    DataSetQueryComponent,
    MyEditorComponent,
    SetCronComponent,
    DataSetAlertComponent,
    StateStepComponet,
    CardSummaryComponent
    // ChartHighChartComponent
  ],
  providers : [
    DataSetService,
    DataSourceService,
    DataSourceKylinQueryService,
    CardService,
    DataSetCanDeactivate
  ]
})
export class DataSetModule{

}
