import { DataSourceService } from "../source/data-source.service";
import { Component, OnInit } from "@angular/core";
import { AppNotification } from "../../../app.notification";
import { DataSet } from "../../../common/model/data-set.model";
import { Subject } from "rxjs/Rx";
import { ActivatedRoute, Router } from "@angular/router";
import { CFG } from "../../../common/CFG";
import { ResourcePermission } from "../../../common/model/resource-permission.model";
import { flyInOut } from "../../../animations";
import { DataSetService } from "./data-set.service";
@Component({
  // selector:'data-set-list',
  templateUrl: "./data-set-list.component.html",
  styleUrls: ["../data-center.component.scss"],
  animations: [flyInOut]
})
export class DataSetListComponent implements OnInit {
  PERMISSION_DATASET_ADD: string = CFG.PERMISSION.DATASET_ADD;
  PERMISSION_TYPE: any = ResourcePermission.PERMISSION_TYPE;
  hasDataSet = true;
  _dataSetList: Array<any> = [];
  _OriginDataSetList: Array<any> = [];

  /**
   * 筛选条件
   * @type {DataSet}
   */
  filterDataSet: DataSet = new DataSet();
  orderByTimeDesc: boolean = true;

  dataSourceSet: Set<any> = new Set<any>();
  createdBySet: Set<string> = new Set<string>();

  searchTermStream = new Subject<string>();
  dataSetEmpty: boolean = false;
  token ='';
  get dataSetList() {
    if (this._dataSetList) {
      return this._dataSetList
        .filter(temp => {
          //dataSet.dataSourceID 无法设置,所以使用dataSetID临时存储使用
          //非空,根据条件判断,条件为空,返回true
          return (
            (this.filterDataSet.dataSetID
              ? temp.dataSourceList.findIndex(t => {
                  return t.dataSourceName == this.filterDataSet.dataSetID;
                }) > -1
              : true) &&
            (this.filterDataSet.createdBy
              ? temp.createdBy == this.filterDataSet.createdBy
              : true) &&
            (this.filterDataSet.dataSetName
              ? new RegExp(this.filterDataSet.dataSetName.toLowerCase()).test(
                  temp.dataSetName.toLowerCase()
                )
              : true)
          );
        })
        .sort((x, y) => {
          if (this.orderByTimeDesc) {
            return (
              new Date(y.updatedTime).getTime() -
              new Date(x.updatedTime).getTime()
            );
          } else {
            return (
              new Date(x.updatedTime).getTime() -
              new Date(y.updatedTime).getTime()
            );
          }
        });
    }
  }

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private appNotification: AppNotification,
    private dataSetService: DataSetService,
    // private appNotification: NzMessageService,
    private dataSourceService: DataSourceService
  ) {
    //TODO: 根据
  }

  ngOnInit() {
    // let token = '';
    location.search.replace('?','').split('&').forEach(v => {
      if(v.indexOf('token')>=0) {
        this.token = v.replace(/token=/,'');
      }
    });
    // console.info("init");
    this.dataSourceSet = new Set<any>();
    this.route.params.subscribe(params => {
      // console.info("初始化查询参数:", params);
      let id = params["dataSourceID"];
      // console.log(1);
      if(id){
        this.getSetList('',id);
      }else{
        this.getSetList('','');
      }
    });
  }

  getSetList(type,id) {
    //TODO : 根据传参初始化数据列表(数据源ID)
    this.dataSetService.getSetList(type,id,this.token).subscribe(
      response => {
        // let redirectUrl = window.location.host + '/#/chang/car/tasks';
        // console.log(redirectUrl);
        // window.location.href = 'http://10.10.26.2:19010/monitor2/login.html?redirectUrl='+redirectUrl;
        if (response && response.data && Array.isArray(response.data)) {
          this.createdBySet.clear();
          this._dataSetList = response.data;
          if (
            this._dataSetList &&
            Array.isArray(this._dataSetList) &&
            this._dataSetList.length !== 0
          ) {
            this._OriginDataSetList = response.data;
            this._dataSetList.map(item => {
              item.dataSourceList.forEach(simpleDataSource => {
                this.dataSourceSet.add(simpleDataSource.dataSourceName);
              });
              this.createdBySet.add(item.createdBy);
            });
          } else {
            this._dataSetList = [];
          }
        }
      },
      error => {
        this.appNotification.error(error.error.errorMsg);
      }
    );
  }

  delete(dataSetID) {
    this.dataSetService.deleteSetItem(dataSetID).subscribe(
      response => {
        this._dataSetList = this._dataSetList.filter(temp => {
          return dataSetID != temp.dataSetID;
        });
        this.appNotification.success('删除成功');
        this.ngOnInit();
      },
      error => {
        this.appNotification.error(error.error.errorMsg);
      }
    );
  }

  /**
   * 搜索
   * @param item
   */
  //按名称过滤
  search(item: string) {
    // console.log(item);
    this.filter("dataSetName", item);
  }

  filter(field: string, value: any) {
    this.filterDataSet[field] = value;
  }

  /**
   * 根据时间进行排序
   * @param asc 升序
   */
  sortByTime() {
    //TODO:根据时间进行排序
    console.log("根据时间进行排序");
    this.orderByTimeDesc = !this.orderByTimeDesc;
  }
  redirectToAddPage(id) {
    // console.log(1);
    this.dataSourceService.getSourceList().subscribe(
      response => {
        if (
          response &&
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          if (id) {
            this.router.navigate(["/chang/set/update", id]);
          } else {
            this.router.navigate(["/chang/set/update"]);
          }
        } else {
          this.appNotification.error("没有可用的数据源,请先创建数据源!");
        }
      },
      error => {
        this.appNotification.error(error.error.errorMsg);
      }
    );
  }
}
