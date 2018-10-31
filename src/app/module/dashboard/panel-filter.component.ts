/**
 * Created by fengjj on 2017/1/17.
 */
//panel-filter.component
import { Component ,ElementRef ,Inject ,OnInit,AfterViewInit ,ViewChild ,Input ,OnChanges ,SimpleChanges,Output,EventEmitter ,Renderer } from '@angular/core';
import {SinglePanelFilter} from "../../common/model/dashboard.model";
@Component({
  selector:'panel-filter',
  templateUrl:'./panel-filter.component.html',
  styleUrls:['./panel-filter.component.css']
})
export class PanelFilterComponent {
  @Input() left:string;
  @Input() top:string;
  @Input() filters:SinglePanelFilter[];
  switchFlag:boolean=false;
  constructor(private renderer:Renderer){

  }
  changeSwitch(e:MouseEvent,item:SinglePanelFilter){
    this.cancelBubble(e);
    console.log('switchFlag:',this.switchFlag);
    this.switchFlag=!this.switchFlag;
    item.show=this.switchFlag;
    let target = <HTMLElement> e.target;
    let pNode = target.parentNode;
    this.renderer.setElementClass(pNode,'open',this.switchFlag);
  }
  cancelBubble(e:MouseEvent){
    e.stopPropagation();
  }
}

