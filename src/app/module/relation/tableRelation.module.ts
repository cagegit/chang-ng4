import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Ng2BootstrapModule} from "ng2-bootstrap";
import {DataSourceService} from "../../common/service/data-source.service";
import {RelationalTableComponent} from "../data-center/set/relational-table.component";
import {AppNotification} from "../../app.notification";
import {AuthDirective} from "../../common/AuthDirective";
import {ResourcePermissionModalComponent} from "../permission/resource-permission-modal.component";
import {ResourcePermissionService} from "../../common/service/resource-permission.service";
import { AddPermissionComponent } from '../permission/add-permission.component'
@NgModule({
  imports: [
    CommonModule,
    Ng2BootstrapModule
  ],
  declarations: [
    RelationalTableComponent,
    AuthDirective,
    ResourcePermissionModalComponent,
    AddPermissionComponent
  ],
  providers : [
    DataSourceService,
    ResourcePermissionService
  ],
  exports : [
    RelationalTableComponent,
    AuthDirective,
    ResourcePermissionModalComponent,
    AddPermissionComponent
  ]
})
export default class TableRelationModule{

}
