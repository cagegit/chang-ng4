import { NgModule } from '@angular/core';
import {LayoutDefaultComponent} from "./default/default.component";
import {LayoutFullScreenComponent} from "./fullscreen/fullscreen.component";
import { NgProgressModule,NgProgressBrowserXhr} from 'ngx-progressbar';
import {RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common'
import {HeadDashboardListComponent} from "../common/module/head-dashboard-list/head-dashboard-list.component";
import {AppNotificationComponent} from "../notification/app-notification.component";
import {ChanganLayoutComponent} from "./changan/changan-layout.component";
import { TransferService } from '../changan/transfer.service';
import { ChangCommonModule } from '../changan/components/chang-common.module';

@NgModule({
  imports: [
    NgProgressModule,
    RouterModule,
    CommonModule,
    ChangCommonModule
  ],
  providers: [TransferService],
  declarations: [
      LayoutDefaultComponent,
      LayoutFullScreenComponent,
      HeadDashboardListComponent,
      AppNotificationComponent,
      ChanganLayoutComponent
  ],
  exports: [
    LayoutDefaultComponent,
    LayoutFullScreenComponent,
    AppNotificationComponent,
    ChanganLayoutComponent
  ]
})
export class LayoutModule { }
