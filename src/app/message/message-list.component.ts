/**
 * Created by fengjj on 2017/2/23.
 */
import { Component ,ViewChild , ElementRef ,Renderer} from '@angular/core';
import {LogService} from "../common/service/log.service";
import {Log} from "../common/model/log.model";
import {CFG} from "../common/CFG";
import { flyIn } from '../animations'
import {AppContext} from "../common/AppContext";
import {SIZES} from "../common/size-in-documnet";
@Component({
  templateUrl:'./message-list.component.html',
  styleUrls:['./message-list.component.css'],
  animations: [
    flyIn
  ]
})
export class MessageListComponent {
  recentlyLogs=[];
  itemsPerPage:number = 20;
  totalItems:number;
  bigCurrentPage:number=1;
  nextText = `<i class="iconfont icon-jiantou-copy"></i>`;
  previousText = `<i class="iconfont icon-jiantouy-copy"></i>`;
  constructor(private renderer:Renderer,private logService:LogService,private appContext : AppContext){
this.getRecentlyLog();
  }
  private _messageBox:ElementRef;
  @ViewChild('messageBox')
  get messageBox():ElementRef {
    return this._messageBox;
  }

  set messageBox(value:ElementRef) {
    this._messageBox = value;
    let height = (document.body.clientHeight || document.documentElement.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT;
    this.renderer.setElementStyle(this.messageBox.nativeElement,'min-height',height+'px');
  }
  pageChanged(e:any){
    this.bigCurrentPage=e.page;
    this.getRecentlyLog();
  }
  getRecentlyLog(){

this.appContext.hasNewNotify=false;
    let curPage=this.bigCurrentPage-1;
    this.logService.getRecently(curPage,this.itemsPerPage).subscribe(rep=>{
      this.recentlyLogs=rep.data as Log[];
      this.totalItems=rep.pageHelper.totalNumbers;

    });

  }
}
