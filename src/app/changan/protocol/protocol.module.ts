import {NgModule} from "@angular/core";
import {TableRelationModule} from "../../module/relation/tableRelation.module";
// import {ResourcePermissionComponent} from "../../module/permission/resource-permission.component";
import {ProtocolConfigComponent} from "./protocol-config.component";
import {ProtocolDetailComponent} from "./protocol-detail.component";
import {ProtocolComponent} from "./protocol.component";
import {ProtocolService} from "./protocol.service";
import {RouterModule} from "@angular/router";
import {routes} from "./protocol.routes";
import {SharedModule} from "../../common/module/shared.module";
import { NgZorroAntdModule } from 'ng-zorro-antd';


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    TableRelationModule,
    NgZorroAntdModule.forRoot()
  ],
  declarations: [
    ProtocolComponent,
    ProtocolConfigComponent,
    ProtocolDetailComponent
  ],
  providers :[
    ProtocolService
  ],
  exports: [
    ProtocolConfigComponent,
    ProtocolDetailComponent
  ]
})
export class ProtocolModule {}
