import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Dashboard} from "../../common/model/dashboard.model";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { AppNotification } from "../../app.notification";
import { ResourcePermission } from "../../common/model/resource-permission.model";
import { CFG } from "../../common/CFG";
import { Observable, Subject } from "rxjs/Rx";
import { AuthService } from "../../auth.service";
import { AppWebSocketService } from "../../common/service/app.websocket.service";
import { AppContext } from "../../common/AppContext";
import { flyInOut } from '../../animations';
import { DashboardService } from './dashboard.service';
import { DataHandleService } from '../../changan/data.handle.service';
import { DataSetService } from '../data-center/set/data-set.service';

@Component({
  styleUrls: ["../data-center/data-center.component.scss"],
  templateUrl: "./dashboard-list.component.html",
  animations: [flyInOut]
})
export class DashboardListComponent implements OnInit {
  private PERMISSION = CFG.PERMISSION;
  _dashboardList: Dashboard[] = [];
  searchTermStream = new Subject<string>();
  // filterText : string = '';
  filterDashboard: Dashboard = new Dashboard();
  createUserDisplayNameSet: Set<string> = new Set<string>();
  maxRecentLength = 10;
  @ViewChild("tableList")
  tableList: ElementRef;
  PERMISSION_DASHBOARD_ADD: string = CFG.PERMISSION.DASHBOARD_ADD;
  PERMISSION_TYPE: any = ResourcePermission.PERMISSION_TYPE;
  addDashboardFlag = this.appContext.hasPermission(
    this.PERMISSION_DASHBOARD_ADD
  );
  RESOURCE_TYPE_DASHBOARD: string = ResourcePermission.RESOURCE_TYPE.DASHBOARD;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private dashboardService: DashboardService,
    private appNotification: AppNotification,
    private appWebSocketService: AppWebSocketService,
    private appContext: AppContext,
    private dataHandleSer: DataHandleService,
    private dataSetService: DataSetService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.info("初始化查询参数:", params);
      this.filterDashboard.createUserDisplayName =
        params["createUserDisplayName"];
      console.info("初始化查询参数绑定:", this.filterDashboard);
    });

    this.searchTermStream
      .debounceTime(500)
      .distinctUntilChanged()
      .switchMap((term: string) => {
        return Observable.of(term);
      })
      .subscribe(term => {
        this.filter("dashboardName", term);
      });

    this.dataHandleSer.getDashboards().subscribe(
      list => {
        if (list && Array.isArray(list) && list.length > 0) {
          this.dashboardList = list;
          console.log(this.dashboardList);
        }
      },
      error => {
        // let redirectUrl;
        // if(ENV === "production"){
        //   if(window.location.host === 'bdp-app.bitnei.cn'){
        //     redirectUrl = 'http://' + window.location.host + '/chang/data-center/list/set/dashboards';
        //   }else{
        //     redirectUrl =  window.location.host + '/chang/data-center/list/set/dashboards';
        //   }
        // }else{
        //   redirectUrl = window.location.host + '/#/chang/data-center/list/set/dashboards';
        // }
        // if(error.status == 400 && error.message == '未登录!'){
        // window.location.href = 'http://10.10.26.2:19010/monitor2/login.html?redirectUrl='+redirectUrl;
        // }
        this.appNotification.error(error.message);
      }
    );
    // this.router.events.filter(event => event instanceof NavigationEnd).subscribe((e:NavigationEnd)=>{
    //   console.log('dashboard list',e.url);
    // })
  }

  toCreateDashboard() {
    this.dataSetService.getSetList("", "").subscribe(
      response => {
        if (
          response &&
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          this.router.navigate(["/dashboard/info/update"]);
        } else {
          this.appNotification.error("没有可用的数据集,请先创建数据集!");
        }
      },
      error => {
        this.appNotification.error(error.message);
      }
    );
  }

  get dashboardList() {
    if (this._dashboardList && Array.isArray(this._dashboardList)) {
      return this._dashboardList.filter(temp => {
        //非空,根据条件判断,条件为空,返回true
        return this.filterDashboard.dashboardName
          ? new RegExp(this.filterDashboard.dashboardName.toLowerCase()).test(
            temp.dashboardName.toLowerCase()
          )
          : true;
      });
    } else {
      return [];
    }
  }

  // &&
  // (this.filterDashboard.createUserDisplayName? (temp.createUserDisplayName == this.filterDashboard.createUserDisplayName) : true)

  set dashboardList(values) {
    this._dashboardList = values;
    this.createUserDisplayNameSet.clear();
    if (this._dashboardList && Array.isArray(this._dashboardList)) {
      this._dashboardList.forEach(tmp => {
        this.createUserDisplayNameSet.add(tmp.createUserDisplayName);
      });
    }
    this.filterDashboard.dashboardName = "";
  }

  search(item) {
    this.filter("dashboardName", item);
  }

  filter(field: string, value: any) {
    this.filterDashboard[field] = value;
  }

  delete(dashboardID) {
    this.dataHandleSer.deleteDashboard(dashboardID).subscribe(
      (b: boolean) => {
        if (b) {
          this._dashboardList = this._dashboardList.filter(
            (temp: Dashboard) => {
              return dashboardID != temp.dashboardID;
            }
          );
          this.appNotification.success("删除成功");
        } else {
          this.appNotification.success("删除失败！");
        }
      },
      error => {
        this.appNotification.error(error.errorMsg);
      }
    );
  }

  // 转到dashboard的编辑界面
  toEditDashboard(dashboardId) {
    this.router.navigate(["/dashboard/info/update/" + dashboardId]);
  }
}
