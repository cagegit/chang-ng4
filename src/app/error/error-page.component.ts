/**
 * Created by fengjj on 2017/3/22.
 */
import { Component ,OnInit} from '@angular/core';
import {SIZES} from "../common/size-in-documnet";
@Component({
  templateUrl:'./error-page.component.html',
  styleUrls:['./error-page.component.css']
})
export class ErrorPageComponent {
  height:number;
  ngOnInit(){
    this.height = (document.documentElement.clientHeight || document.body.clientHeight) - SIZES.FOOT_HEIGHT - SIZES.HEAD_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT;
  }
}
