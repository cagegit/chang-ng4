import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ModalModule} from "ngx-bootstrap";
import {DataSourceService} from "../../common/service/data-source.service";
import {RelationalTableComponent} from "../data-center/set/relational-table.component";
import {AuthDirective} from "../../common/AuthDirective";
import {ResourcePermissionModalComponent} from "../permission/resource-permission-modal.component";
import {ResourcePermissionService} from "../../common/service/resource-permission.service";
import { AddPermissionComponent } from '../permission/add-permission.component'
@NgModule({
  imports: [
    CommonModule,
    ModalModule
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
export class TableRelationModule{

}
