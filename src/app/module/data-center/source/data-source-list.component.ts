import { Component, OnInit, ViewChild } from "@angular/core";
import { AppNotification } from "../../../app.notification";
import { DataSourceService } from "./data-source.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { AppContext } from "../../../common/AppContext";
import { CFG } from "../../../common/CFG";
import { ResourcePermission } from "../../../common/model/resource-permission.model";
import { NgProgressModule } from "ng2-progressbar/dist/index";
import { DataSourceAddModalComponent } from "./data-source-add.component";
import { flyInOut } from "../../../animations";
@Component({
  templateUrl: "./data-source-list.component.html",
  styleUrls: ["../data-center.component.scss"],
  animations: [flyInOut]
})
export class DataSourceListComponent implements OnInit {
  @ViewChild("showAddDataSourceModal")
  showAddDataSourceModal: DataSourceAddModalComponent;
  _dataSourceList: Array<any> = [];
  selectSourceType: string = "mysql";

  PERMISSION_DATASOURCE_ADD: string = CFG.PERMISSION.DATASOURCE_ADD;
  RESOURCE_TYPE_DATA_SOURCE: string =
    ResourcePermission.RESOURCE_TYPE.DATA_SOURCE;
  PERMISSION_TYPE: any = ResourcePermission.PERMISSION_TYPE;
  constructor(
    public router: Router,
    private dataSourceService: DataSourceService,
    private appNotification: AppNotification,
    private appContext: AppContext,
    private route: ActivatedRoute
  ) {}

  get hasDataSourceList(): boolean {
    return this._dataSourceList &&
      Array.isArray(this._dataSourceList) &&
      this._dataSourceList.length !== 0
      ? true
      : false;
  }
  ngOnInit() {
    this.dataSourceService.getSourceList().subscribe(
      response => {
        if (response && response.data && Array.isArray(response.data)) {
          this._dataSourceList = response.data;
          // this._dataSourceList.forEach(element => {
          //   // element.updateTime = 1540454688000;
          //   element.updateTime = this.formatDate(element.updateTime);
          // });
        }
      },
      error => {
        this.appNotification.error(error.error.errorMsg);
      }
    );
    //新增数据源入口 isAdd
    this.route.queryParams.subscribe((params: Params) => {
      if (params["isAdd"]) {
        setTimeout(() => {
          this.showAddDataSourceModal.show();
        }, 0);
      }
    });
  }

  delete(id: string) {
    this.dataSourceService.deleteDataSourceItem(id).subscribe(
      () => {
        this._dataSourceList = this._dataSourceList.filter(temp => {
          return id != temp.id;
        });
        this.appNotification.success('删除成功');
      },
      error => {
        this.appNotification.error(error.error.errorMsg);

      }
    );
  }

  selectAddDataSource() {
    this.router.navigate([
      `/chang/data-center/source/update/${this.selectSourceType}`
    ]);
  }

  // formatDate(value) {
  //   let date = "";
  //   let dateObj = new Date(value);
  //   date =
  //     dateObj.getFullYear() +
  //     "-" +
  //     this.backTwoNum(dateObj.getMonth() + 1) +
  //     "-" +
  //     this.backTwoNum(dateObj.getDate()) +
  //     " ";
  //   date +=
  //     this.backTwoNum(dateObj.getHours()) +
  //     ":" +
  //     this.backTwoNum(dateObj.getMinutes()) +
  //     ":" +
  //     this.backTwoNum(dateObj.getSeconds());
  //   date += "";
  //   return date;
  // }

  // backTwoNum(n: number): string {
  //   if (n < 10) {
  //     return "0" + n;
  //   } else {
  //     return n.toString();
  //   }
  // }
}
