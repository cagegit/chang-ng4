/**
 * Created by fengjj on 2016/10/12.
 */
import { Component ,AfterViewInit,ViewChild,ElementRef ,Renderer} from '@angular/core';
import {SIZES} from "../../common/size-in-documnet";
@Component({
  selector:"reg-ok",
  templateUrl:'./reg-ok.component.html',
  styleUrls:['./reg-ok.component.css']
})
export class RegOkComponent implements AfterViewInit {
  @ViewChild('appMain') appMain:ElementRef;
  constructor(private renderer:Renderer){}
 ngAfterViewInit() {
   let winH = document.body.clientHeight || document.documentElement.clientHeight;
   this.renderer.setElementStyle(this.appMain.nativeElement,'height',winH - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT +'px');
 }
}
