/**
 * Created by fengjj on 2016/9/19.
 */
import { Component ,ViewChildDecorator , ElementRef, ViewChild, Renderer,OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {CFG} from "../common/CFG";
import { computeMinHeight } from '../common/service/compute-min-height';
import {DashboardService} from "../common/service/dashboard.service";
import {Dashboard} from "../common/model/dashboard.model";
import {Subject, Observable} from "rxjs/Rx";
import {AppNotification} from "../app.notification";
import {Error} from "../common/model/Error"
import {ResourcePermission} from "../common/model/resource-permission.model";
import {LogService} from "../common/service/log.service";
import {Log} from "../common/model/log.model";
import {AppWebSocketService} from "../common/service/app.websocket.service";
import {DataSet} from "../common/model/data-set.model";
import {Router} from "@angular/router";
import {AppContext} from "../common/AppContext";
import { DataHandleService } from '../changan/data.handle.service';
@Component({
  templateUrl:'home.component.html',
  styleUrls:['home.component.css'],
  // pipes:[LogResourcePipe]
})
export class HomeComponent implements OnInit {
  private PERMISSION = CFG.PERMISSION;
  _dashboardList:Dashboard[]=[];
  searchTermStream = new Subject<string>();
  filterText : string = '';

  @ViewChild('appHomeBox') appHomeBox:ElementRef;
  //private _homeRight:ElementRef;
  //@ViewChild('homeRight')
  //set homeRight(value:ElementRef) {
  //  this._homeRight = value;
  //  let height = (document.body.clientHeight || document.documentElement.clientHeight) - 76 - 45;
  //  this.renderer.setElementStyle(this.homeRight.nativeElement,'min-height',`${height}px`);
  //}
  //get homeRight(){
  //  return this._homeRight;
  //}
  @ViewChild('tableList') tableList:ElementRef;

  PERMISSION_DASHBOARD_ADD : string=CFG.PERMISSION.DASHBOARD_ADD;
  PERMISSION_TYPE : any=ResourcePermission.PERMISSION_TYPE;
  addDashboardFlag = this.appContext.hasPermission(this.PERMISSION_DASHBOARD_ADD)
  constructor(private router: Router,public authService : AuthService,private renderer:Renderer,private dashboardService:DashboardService,private appNotification : AppNotification,private logService:LogService,private appWebSocketService:AppWebSocketService,private appContext:AppContext,
              private dataHandleSer:DataHandleService){
    //this.getExportLog();
    //this.getRecentlyLog();
  }

  ngOnInit(){
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((term:string) => {
        return Observable.of(term)
      }).subscribe((term) => {
      this.filter(term);
    });

    this.dataHandleSer.getDashboards().subscribe((data:Dashboard[])=>{
      this.dashboardList = data;
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });

  }

  toCreateDashboard(){
    this.dashboardService.getDatasetList().subscribe((data:DataSet[])=>{
      if(data.length>0){
        this.router.navigate(['/dashboard/update']);
      }
    },(error)=>{
      if(error.errCode==404){
        this.appNotification.error("没有可用的数据集,请先创建数据集!");
      }
    });
  }




  get dashboardList() : Dashboard[]{
    // return [];
    if(this._dashboardList) {
      return this._dashboardList.filter((temp:Dashboard)=> {
        //非空,根据条件判断,条件为空,返回true
        return (this.filterText? new RegExp(this.filterText.toLowerCase()).test(temp.dashboardName.toLowerCase()) : true);
      });
    }else{
      return [];
    }
  }

  set dashboardList(values : Dashboard[]){
    this._dashboardList=values.sort((x:Dashboard, y:Dashboard)=> {
      return  y.updatedTime-x.updatedTime;
    });
  }

  search(item:string) {
    this.searchTermStream.next(item);
  }

  filter(value : any){
    this.filterText=value;
  }

  delete(dashboardID : string){
    this.dashboardService.delete(dashboardID).subscribe(()=>{
      this._dashboardList=this._dashboardList.filter((temp : Dashboard)=>{
        return dashboardID!=temp.dashboardID;
      });
    },(error)=>{
      this.appNotification.error(error.errMsg);
    })
  }

  //private  setHeightFn(h = 0){
  //  let winHei = (document.documentElement.clientHeight || document.body.clientHeight) - 76 - 45 ;
  //  //let rightH = this.homeRight.nativeElement.getBoundingClientRect().height;
  //  let tableListH = this.tableList.nativeElement.getBoundingClientRect().height;
  //  tableListH = tableListH?tableListH:316;
  //  let rightH = 110 + tableListH + h;
  //  //console.log(this.tableList.nativeElement.innerHTML);
  //  //console.log(rightH,tableListH,h);
  //  if(winHei<rightH){ // 出去头部底部的高度 小于 右侧高度
  //    this.renderer.setElementStyle(this.appHomeBox.nativeElement,'min-height',rightH+'px');
  //    this.renderer.setElementStyle(this.homeRight.nativeElement,'min-height',rightH+'px');
  //  }else {
  //    //computeMinHeight.setMinHeight(this.renderer,this.appHomeBox.nativeElement)
  //    //this.renderer.setElementStyle(this.appHomeBox.nativeElement,'min-height',rightH+'px');
  //    this.renderer.setElementStyle(this.homeRight.nativeElement,'min-height',winHei+'px');
  //  }
  //}
  //private viewChangeFn(h:number){
  //  setTimeout(()=>{
  //    this.setHeightFn(h);
  //  },0)
  //}
}
