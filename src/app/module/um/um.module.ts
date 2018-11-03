import {NgModule} from "@angular/core";

import {UmComponent} from "./um.component";
import {UmAuthComponent} from "./auth/um-auth.component";
import {UmUserComponent} from "./user/um-user.component";
import {UmGroupComponent} from "./group/um-group.component";
import {UserListComponent} from "./user/user-list.component";
import {UserDetailComponent} from "./user/user-detail.component";
import {UmUserService} from "./user/um-user.service";
import {routes} from "./um.routes";
import {UmGroupService} from "./group/um-group.service";
import {UmGroupDetailComponent} from "./group/um-group-detail.component";
import {SharedModule} from "../../common/module/shared.module";
import {TableRelationModule} from "../relation/tableRelation.module";
import {ResourcePermissionComponent} from "../permission/resource-permission.component";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    TableRelationModule
  ],
  declarations: [
    UmComponent,
    UmAuthComponent,
    UmUserComponent,
    UmGroupComponent,
    UmGroupDetailComponent,
    UserListComponent,
    UserDetailComponent,
    ResourcePermissionComponent
  ],
  providers :[
    UmUserService,
    UmGroupService,
  ]
})
export class UmModule {}

