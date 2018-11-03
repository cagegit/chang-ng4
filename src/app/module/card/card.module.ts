import {NgModule} from "@angular/core";
import {CardUpdateComponent} from "./card-update.component";
import {CardComponent} from "./card.component";
import {DataSetService} from "../../common/service/data-set.service";
import {CardService} from "../../common/service/card.service";
import {SharedModule} from "../../common/module/shared.module";
import {SetFilterComponent} from "./set-filter.component";
import {NoSaveComponent} from "./no-save.component";
import {DragulaModule, DragulaService} from "ng2-dragula/ng2-dragula";
import {OperaterListComponent} from "./operater-list.component";
import {RouterModule} from "@angular/router";
import {routes} from "./card.routes";
import {CardChangeShowComponent} from "./card.changeshow.component";
import {OlapComponent} from "./card.olap.component";
import {OlapMetaDataComponent} from './card.olap.metadata.component'
import {QueryComponent} from "./card.query.component";
import {QueryMetaDataComponent} from "./card.query.metadata.component";
import {QueryDimensionComponent} from "./card.query.dimension.component";
import {QueryOriginalShowComponent} from "./card.query.originalshow.component";
import {QueryPrettyShowComponent} from "./card.query.prettyshow.component";
import {ChartMapModule} from "../../common/maps/chart.map.module";
import {CardLimitComponent} from "./card.limit.component";
import { DataHandleService } from '../../changan/data.handle.service';
@NgModule({
  imports: [
    SharedModule,
    DragulaModule,
    ChartMapModule,
    RouterModule.forChild(routes)

  ],
  declarations: [
    CardComponent,
    CardUpdateComponent,
    SetFilterComponent,
    NoSaveComponent,
    OperaterListComponent,
    CardChangeShowComponent,
    OlapComponent,
    OlapMetaDataComponent,
    QueryComponent,
    QueryMetaDataComponent,
    QueryDimensionComponent,
    QueryOriginalShowComponent,
    QueryPrettyShowComponent,
    CardLimitComponent
  ],
  providers : [
    DataSetService,
    CardService,
    DragulaService,
    DataHandleService
  ]
})
export  class CardModule{

}
