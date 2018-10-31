import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {SharedModule} from "../../common/module/shared.module";
import {UploaderToolComponent} from "./uploader-tool.component";
import { DashHeadComponent } from './dash-head.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    UploaderToolComponent,
    DashHeadComponent
  ],
  providers: [],
  exports: [
    UploaderToolComponent,
    DashHeadComponent
  ]
})
export class ChangCommonModule {}
