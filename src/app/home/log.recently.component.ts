/**
 * Created by houxh on 2017-2-20.
 */
import {Component,Input,AfterViewChecked,Output,EventEmitter,ViewChild ,ElementRef} from "@angular/core";
import {Log} from "../common/model/log.model";
import {CFG} from "../common/CFG";
import {AppWebSocketService} from "../common/service/app.websocket.service";

@Component({
  selector:'log-recently',
  templateUrl:'log-recently.component.html',
  styles:[`
  .rep-li{line-height:45px;}
  .rep-li img{float: left;margin-top: 5px;}
  .rep-li span{margin-left:5px}
  .log-text{text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}
  .icon_box{ width: 18px; height: 18px; text-align: center; color: #fff; line-height: 18px;    margin-top: 13px;float:left;}
.icon_box i{ font-size: 16px;}
.icon_box i.icon-shujuku{ font-size: 14px;}
.bg_green{ background-color: #53bb9b; }
.bg_red{ background-color: #ef5350;}
.bg_yellow{ background-color: #f48c37;}
.bg_purple{ background-color: #8562a3;}
  `]
})

export class LogRecentlyComponent{
  @Output() viewChangeEvent = new EventEmitter();
  @ViewChild('recentBox') recentBox:ElementRef;
  private maxLengthFlag = false;
  @Input() maxRecentLength:number;
  private _recentlyLogs:Log[];
  @Input()
  set recentlyLogs(value:Log[]){
    console.log('recent',value)
    this._recentlyLogs = value;
  }
  get recentlyLogs():Log[]{
    // console.log('get recent',this._recentlyLogs.length)
    if(this._recentlyLogs.length && !this.maxLengthFlag){

      setTimeout(()=>{
        let h = this.recentBox.nativeElement.getBoundingClientRect().height;
        this.viewChangeEvent.next(h);
      },0)
    }
    if(this.maxLengthFlag && this._recentlyLogs.length != this.maxRecentLength){ //上次recentlyLogs.lenght达到最大长度(maxRecentLenght) 并且 本次查询list 长度<maxRecentLenght
      this.maxLengthFlag = false;
    }else if(this._recentlyLogs.length == this.maxRecentLength) {
      this.maxLengthFlag = true;
    }else {
      this.maxLengthFlag = false;
    }
    return this._recentlyLogs;
  }

  //ngAfterViewChecked(){
  //  //this.viewChangeEvent.next();
  //  //if(this.recentlyLogs.length<=10){
  //  //  setTimeout(()=>{
  //  //    let h = this.recentBox.nativeElement.getBoundingClientRect().height;
  //  //    //console.log(this.recentBox,h);
  //  //    this.viewChangeEvent.next(h);
  //  //  },0)
  //  //}
  //  //console.log('view checked')
  //}

}
