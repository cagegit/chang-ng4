import { NgModule } from "@angular/core";
import TableRelationModule from "../../module/relation/tableRelation.module";
// import { ResourcePermissionComponent } from "../../module/permission/resource-permission.component";
import { ForwardConfigComponent } from "./forward-config.component";
import { ForwardComponent } from "./forward.component";
import { TaskDetailComponent } from "./task-detail.component";
import { TaskVehicleComponent } from "./task-vehicle.component";
import { TaskComponent } from "./task.component";
import { ForwardService } from "./forward.service";
import { ProtocolService } from "../protocol/protocol.service";
import { RouterModule } from "@angular/router";
import { routes } from "./forward.routes";
import { SharedModule } from "../../common/module/shared.module";
import { NgZorroAntdModule } from 'ng-zorro-antd';
// import {UploaderToolComponent} from "./components/uploader-tool.component";
// import { ChangModule } from '../chang.module';

import {ChangCommonModule} from "../components/chang-common.module";

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    TableRelationModule,
    NgZorroAntdModule.forRoot(),
    // ChangModule
    // NgZorroAntdModule,
    ChangCommonModule
  ],
  declarations: [
    ForwardComponent,
    ForwardConfigComponent,
    TaskComponent,
    TaskDetailComponent,
    TaskVehicleComponent
  ],
  providers: [ForwardService, ProtocolService],
  exports: [
    ForwardConfigComponent,
    TaskComponent,
    TaskDetailComponent,
    TaskVehicleComponent
  ]
})
export class ForwardModule {}
