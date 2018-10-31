/**
 * Created by fengjj on 2017/1/3.
 */
import { Component ,EventEmitter,Output ,Input } from '@angular/core';
import { PanelType } from '../../common/model/dashboard.model';
@Component({
  selector:'panel-type',
  styles:[`
    .panel_type{position: absolute;width:192px; padding:12px 18px; background-color: #fff; border:1px solid #e3edf4;z-index: 100;cursor:pointer; /*display: none;*/}
    .panel_type:before,.panel_type:after{ content: '';width: 0; height: 0;overflow: hidden; position: absolute; border-bottom: 8px solid #e3edf4; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: none; left: 10px; top: -8px;}
    .panel_type:after{top: -7px; border-bottom-color: #fff;}
    .has_panel_type .panel_type{ display: block; }
    .panel_type li{height: 31px; line-height: 30px; border-bottom:1px solid #e4edf4; padding: 0 3px; color: #333;  font-size: 12px;}
    .panel_type li i{color: #333; margin-right:3px;}
    .panel_type li:hover,.panel_type li:hover i{ color: #859acf;}

  `],
  template:`
    <ul class="panel_type" (click)="cancelBubble($event)" (mousedown)="cancelBubble($event)" [style.top.px]="top" [style.left.px]="left">
      <li (click)="changePanelType($event,0)"><i class="iconfont icon-shujuji"></i>数据报表</li>
      <!--<li (click)="changePanelType($event,1)"><i class="iconfont icon-shaixuan"></i>筛选条件</li>-->
      <li (click)="changePanelType($event,2)"><i class="iconfont icon-wenben"></i>文本</li>
      <!--<li  (click)="changePanelType($event,3)"><i class="iconfont icon-tupian"></i>图片</li>-->
    </ul>
  `
})
export class PaneTypeComponet {
  @Input() left:string;
  @Input() top:string;
  @Output() changePanelTypeEvent = new EventEmitter();
  constructor(){

  }
  changePanelType(e:MouseEvent,type:PanelType){
    this.changePanelTypeEvent.emit(type);
  }
  private cancelBubble(e:MouseEvent){
    e.stopPropagation();
    e.preventDefault();
  }
}
