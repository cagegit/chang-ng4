/**
 * Created by fengjj on 2016/12/26.
 */
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {ResourcePermission} from "../../common/model/resource-permission.model";
import {Observable, Subject} from "rxjs/Rx";
import {ResourcePermissionService} from "../../common/service/resource-permission.service";
import {AppNotification} from "../../app.notification";
import {Error} from "../../common/model/Error";
@Component({
  selector:'add-permission',
  styles:[
    `
    .add_option{ z-index:1; position: absolute; left: 510px; top: 130px; height: 235px; background-color: #fff; border:1px solid #e3edf4; padding: 20px; width: 220px; border-radius: 2px; box-shadow: 1px 1px  4px rgba(0,0,0,1)}
    .add_option:before,.add_option:after{ position: absolute; left:10px;top: -8px; border-bottom: 8px solid #e3edf4; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 0; content:'';width: 0; height: 0; overflow: hidden;}
    .add_option:after{ top: -7px; border-bottom-color:#fff; }
    .option_search{ position: relative; width: 100%; line-height: 26px;}
    .option_search input{ width: 100%; height: 26px; color:#333; border:1px solid #e6eaec; background-color: #f7f7f7; border-radius: 2px; padding: 0 10px 0 30px;}
    .option_search i{ color: #b4b7c6; position: absolute; left: 5px; font-size: 14px;}
    .option_list{ height: 140px; margin: 10px 0;}
    .option_list li{ line-height: 36px; padding:0 10px; color: #666; font-size: 12px;}
    .option_list li span{width:130px;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
    .option_list  label{ width: 15px; vertical-align: middle; padding: 0; margin-top: 10px;}
    .option_operator{ height:30px; line-height: 30px; position: absolute; bottom: 0; left: 0; width: 100%; background-color: #f7f7f7; padding: 0 10px; }
    .option_operator .icon-duihao{ color: #64af4a;}
    .option_operator .icon-xxz{ color: #f04a47;}
    .d-right:before,.d-right:after{left:202px;}
    `
  ],
  template:`
    <div class="add_option" *ngIf = "addFlag" [style.top.px]="top" [style.left.px]="left" [class.d-right]="direction != 'left'">
        <div class="option_search"><i class="iconfont icon-fangdajing"></i><input type="text" (keyup)='search($event.target.value)'></div>
        <ul class="option_list scroll_bar">
          <li class="self_clearfix" *ngFor="let item of resourcePermissionList">
            <span class="self_left" title="{{item.resourceName}}">{{item.resourceName}}</span>
            <label class="mock_label self_right">
              <input type="checkbox" class="mock_input" [checked]="item.checked" (change)="change($event.target,item);" >
              <i class="right_con"></i>
              <div class="mock_box"></div>
            </label>
          </li>
        </ul>
        <div class="option_operator self_clearfix">
          <i class="iconfont icon-xxz self_cursor self_left" (click)="hide()"></i>
          <i class="iconfont icon-duihao self_cursor self_right" (click)="save()"></i>
        </div>
      </div>
  `
})
export class AddPermissionComponent implements  OnInit {
  addFlag = false;
  @Input() top:string;
  @Input() left:string;
  @Input() direction:string;
  @Output() selectChange = new EventEmitter<ResourcePermission[]>();

  relationResourceID : string;
  relationResuourceType : string;
  resuourceType : string;
  existResourcePermissionList : ResourcePermission[]=[];
  _resourcePermissionList : ResourcePermission[]=[];
  filterSearch : string;
  searchTermStream = new Subject<any>();



  constructor(public resourcePermissionService : ResourcePermissionService, public appNotification : AppNotification){
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((keyword : string) => {
        return Observable.of(keyword);
      }).subscribe((keyword : string) => {
      this.filter(keyword);
    });
  }

  ngOnInit() {
    console.log(this.direction)
  }

  get resourcePermissionList() : ResourcePermission[]{
    return this._resourcePermissionList.filter((resourcePermission : ResourcePermission)=>{
      return (this.filterSearch? new RegExp(this.filterSearch.toLowerCase()).test(resourcePermission.resourceName.toLowerCase()) : true);
    });
  }

  show(relationResourceID : string,relationResuourceType : string,resuourceType : string,resourcePermissionList : ResourcePermission[]){
    console.log("show:",relationResourceID,relationResuourceType,resuourceType,resourcePermissionList);
    this.relationResourceID=relationResourceID;
    this.existResourcePermissionList=resourcePermissionList;
    this.relationResuourceType=relationResuourceType;
    this.resuourceType=resuourceType;
    this.initPage();
    this.addFlag = true;
  }

  /**
   * 搜索
   * @param item
   */
  search(keyword : string) {
    this.searchTermStream.next(keyword);
  }
  filter(keyword : string){
    this.filterSearch=keyword;
  }

  initPage(){
    this.resourcePermissionService.findNotRelation(this.relationResourceID,this.relationResuourceType,this.resuourceType,this.existResourcePermissionList).subscribe((resourcePermissionList : ResourcePermission[])=>{
      console.info("返回结果:",resourcePermissionList);
      this._resourcePermissionList=resourcePermissionList;
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }

  change(target : any,resourcePermission : ResourcePermission) {
    resourcePermission.checked=target.checked;
    /*    console.info("当前选中状态:",target.checked);
     permission.isAllowed = target.checked;
     this.submitted=true;
     this.umAuthService.updatePermission(role,permission).toPromise().then((response : any)=>{

     }).catch((response : any)=>{
     let message=DomainFactory.buildError(response.json()).errMsg;
     this.appNotification.error(message);

     target.checked=!target.checked;
     })
     this.submitted=false;*/
  }


  hide() {
    this.addFlag = false;
  }

  save(){
    let checkeds=this.resourcePermissionList.filter((resourcePermission : ResourcePermission)=>{
      return resourcePermission.checked==true;
    })
    if(checkeds.length>0){
      this.selectChange.emit(checkeds);
      this.hide();
    }else{
      this.appNotification.error("请选择!");
    }

  }

}
