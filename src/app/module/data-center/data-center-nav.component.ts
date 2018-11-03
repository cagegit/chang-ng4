/**
 * Created by fengjj on 2017/4/6.
 */
import { Component, style ,AfterViewInit} from '@angular/core';
import { CFG } from "../../common/CFG";
import { AppContext } from "../../common/AppContext";
@Component({
  selector: "data-center-nav",
  template: `
    <ul class="data_nav self_clearfix">
      <li [routerLink]="['/chang/data-center/config/menu']" routerLinkActive="cur">可配置报表</li>
      <li [routerLink]="['/chang/data-center/list/set']" routerLinkActive="cur">多维分析</li>
    </ul>
  `,
  styleUrls: ["./data-center.component.scss"],
})
export class DataCenterNavComponent implements AfterViewInit{
  DISPLAY_SWITCH_ISOURCE: string = CFG.DISPLAY_SWITCH.ISOURCE;
  constructor(private appContext: AppContext) {}

  ngAfterViewInit() {
    // console.log(window.location.href);
    // let href = window.location.href;
    // let url = href.split('#')[1];
    // let key =href.split('/');
    // console.log(key);
  }

}

