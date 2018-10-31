import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import {CarZfComponent} from "./car/car-zf.component";
import {CarLogComponent} from "./car/car-log.component";
import {ChangRoutingModule} from "./chang-routing.module";
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {ChangService} from "./chang.service";
import {SharedModule} from "../common/module/shared.module";
import { ProtocolModule } from "./protocol/protocol.module"
import {ForwardModule} from "./forward/forward.module";
import {ChangCommonModule} from "./components/chang-common.module";
import {ChangAnComponent} from "./chang-an.component";
import {CanLeaveZf} from "./car/can-leave-zf";
import { CarSearchComponent } from './car-activity/car-search.component';
@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChangRoutingModule,
    NgZorroAntdModule,
    SharedModule,
    ProtocolModule,
    ForwardModule,
    ChangCommonModule
  ],
  providers: [
    ChangService,
    CanLeaveZf
  ],
  declarations: [
     ChangAnComponent,
     CarZfComponent,
     CarLogComponent,
    //  CarSearchComponent
  ],
  exports: [
    ChangAnComponent,
    // CarSearchComponent
  ]
})
export class ChangModule { }
