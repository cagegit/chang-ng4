/**
 * Created by fengjj on 2017/3/31.
 */
import { Component ,Renderer } from '@angular/core'
import {LogService} from "../../service/log.service";
import {AuthService} from "../../../auth.service";
import {DashboardService} from "../../service/dashboard.service";
import {AppNotification} from "../../../app.notification";
import {AppWebSocketService} from "../../service/app.websocket.service";
import {AppContext} from "../../AppContext";
import {Router} from "@angular/router";
import {Log} from "../../model/log.model";
@Component({
  selector:'app-right',
  templateUrl:'./app-right.component.html',
  styleUrls:['./app-right.component.css']
})
export class AppRightComponent{
  reportLogs = [];
  recentlyLogs = [];
  maxRecentLength = 10;
  constructor(private router: Router,public authService : AuthService,private renderer:Renderer,private dashboardService:DashboardService,private appNotification : AppNotification,private logService:LogService,private appWebSocketService:AppWebSocketService,private appContext:AppContext){
    this.getExportLog();
    this.getRecentlyLog();
  }
  getExportLog(){
    this.logService.getExportLog(5,0).subscribe(rep=>{
      console.log('rep',rep);
      this.reportLogs= rep.data as Log[];
    });
  }
  getRecentlyLog(){
    this.logService.getRecently(0,this.maxRecentLength).subscribe(rep=>{
      if(rep.data!=null) {
        this.recentlyLogs = rep.data as Log[];
        console.log('recentlyLogs',this.recentlyLogs)
      }
      this.updateRecentlyLog();
    });

  }

  updateRecentlyLog(){
    this.appWebSocketService.successNotification.subscribe((s:string)=>{
      //只有当数量大于10个时，删除最后一个
      this.recentlyLogs.unshift(JSON.parse(s));
      if(this.recentlyLogs.length>10) {
        this.recentlyLogs.pop();
      }
    })
  }
}
