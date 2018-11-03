import { Component, AfterViewInit, Renderer, OnInit } from "@angular/core";
import { AppNotification } from "../../../app.notification";
import { NzMessageService } from "ng-zorro-antd";
import { ConfigService } from "./config.service";
import { CHART_TYPE_LIST } from "../../../changan/CFG_CHANG";

@Component({
  templateUrl: "./config-table.component.html",
  styleUrls: ["./config.component.css"]
})
export class ConfigTableComponent implements OnInit, AfterViewInit {
  searchList: Array<any> = [];
  _dataSet: any;
  isDashShow = false;
  tableIdStr = "";
  timeRange = ""; // 搜索的默认时间范围
  _tableSet: Array<any> = [];
  chartTypeList: Array<any> = [];
  addData: any = {};
  originData: any = {};
  currentIndex: string;
  searchKey: string;
  isVisible = false;
  title: string;
  private regex = new RegExp(
    "[`~!@#$^%&*()=|{}':',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘：”“'。，、？《》]"
  );
  private regFH3 = /^([0-9]+:[0-1])(;([0-9]+:[0-1]))*$/;

  private regFH = /(^[^;]([a-z0-9A-Z]*;)*[^;]$)|(^[a-zA-Z0-9]*[a-zA-Z0-9]$)/;

  private regDH = /^([0-9]+)(;([0-9]+))*$/;

  private regDH1 = /^([0-9]+)(;([0-9]+))*$/;

  private numberRegex = /^\d{1,2}$/;
  private onlyNumberReg = /^[0-9]+$/;
  private space = /(^\s+)|(\s+$)/;
  private spaceAny = /(\s+)/;
  constructor(
    private renderer: Renderer,
    private appNotification: AppNotification,
    private _message: NzMessageService,
    private configService: ConfigService
  ) {}
  ngOnInit() {
    this.chartTypeList = CHART_TYPE_LIST;
    this.searchFun("");
  }

  ngAfterViewInit() {}

  searchFun(value) {
    //查询数据
    this.configService.getTableList(value).subscribe(
      response => {
        if (response && response.data && Array.isArray(response.data)) {
          this.searchList = response.data;
          if (this.searchList && this.searchList.length !== 0) {
            const item = this.searchList.find(
              item => item.id === this.currentIndex
            );
            if (item) {
              this.clickFun(item);
            } else {
              this.clickFun(this.searchList[0]);
            }
          }
        }
      },
      response => {
        this.appNotification.error(response.error.errorMsg);
      }
    );
  }

  //show新增model
  show(flag, item) {
    this.isVisible = true;
    if (flag == "add") {
      this.title = "新增配置报表";
      this.addData = {
        headRowspan: 1,
        chartAxisIndex: 0,
        status: "1"
      };
      this.addData.chartNameShow = "1";
    } else {
      this.title = "编辑配置报表";
      this.addData = JSON.parse(JSON.stringify(item));
      this.originData = JSON.parse(JSON.stringify(item));
      this.addData.status = this.addData.status + "";
      let extAttribute = JSON.parse(this.addData.extAttribute);
      this.addData.chartNameShow = extAttribute["chat_name_show"] + "";
      this.addData.attrFilter =
        extAttribute["attrFilter"] !== "null" ? extAttribute["attrFilter"] : "";
      if (this.addData.defaultTime) {
        this.addData.defaultTimeStart = this.addData.defaultTime.split(":")[0];
        this.addData.defaultTimeEnd = this.addData.defaultTime.split(":")[1];
      }
    }
  }

  clear() {
    if (this.addData && this.addData.id) {
      this.addData = JSON.parse(JSON.stringify(this.originData));
      this.addData.status = this.addData.status + "";
      this.addData.chartNameShow = this.addData.chartNameShow + "";
      let extAttribute = JSON.parse(this.addData.extAttribute);
      this.addData.attrFilter =
        extAttribute["attrFilter"] !== "null" ? extAttribute["attrFilter"] : "";
      if (this.addData.defaultTime) {
        this.addData.defaultTimeStart = this.addData.defaultTime.split(":")[0];
        this.addData.defaultTimeEnd = this.addData.defaultTime.split(":")[1];
      }
    } else {
      this.addData = {};
      this.addData.status = "1";
      this.addData.chartNameShow = "1";
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  clickFun(value) {
    this.currentIndex = "";
    if (value && value.id) {
      this.currentIndex = value.id;
      this.getDetailById(value.id);
    }
  }

  getDetailById(id) {
    this.configService.getTableDetailById(id).subscribe(
      response => {
        if (response && response.data) {
          // console.log(response.data.tableInfo.chartType);
          this.chartTypeList.forEach(item => {
            if (item.id == response.data.tableInfo.chartType) {
              response.data.tableInfo.chartType = item.name;
            }
          });
          let extAttribute = JSON.parse(response.data.tableInfo.extAttribute);
          response.data.tableInfo.chartShow =
            extAttribute["chat_name_show"] + "";
          response.data.tableInfo.attrFilter =
            extAttribute["attrFilter"] !== "null"
              ? extAttribute["attrFilter"]
              : "-";
          this._dataSet = response.data.tableInfo;
          if (this._dataSet && this._dataSet["id"]) {
            this.isDashShow = true;
            this.tableIdStr = Date.now() + "-" + this._dataSet["id"];
            this.timeRange = this._dataSet["defaultTime"] || "14:1";
          }
          this._tableSet = response.data.menuList;
        }
      },
      response => {
        this.appNotification.error(response.error.errorMsg);
      }
    );
  }

  submit() {
    if (
      !this.addData.name ||
      (this.addData.name && this.addData.name.length < 2) ||
      (this.addData.name && this.addData.name.length > 20) ||
      (this.addData.name && this.regex.test(this.addData.name)) ||
      (this.addData.name && this.space.test(this.addData.name))
    ) {
      this.appNotification.error(
        "请输入任务名称(2-20字符,特殊字符除外,首尾不可有空格)"
      );
    } else if (
      !this.addData.headName ||
      (this.addData.headName &&
        this.regex.test(this.addData.headName) &&
        !this.regFH.test(this.addData.headName)) ||
      (this.addData.chartValueIndex &&
        this.spaceAny.test(this.addData.headName))
    ) {
      this.appNotification.error(
        "请输入表格列名称(以英文分号分隔)(不可输入除分号外的特殊字符)"
      );
    } else if (!this.addData.chartType) {
      this.appNotification.error("请选择图类型");
    } else if (
      !this.addData.chartNameIndex ||
      (this.addData.chartNameIndex &&
        !this.regDH.test(this.addData.chartNameIndex)) ||
      (this.addData.chartValueIndex &&
        this.spaceAny.test(this.addData.chartNameIndex))
    ) {
      this.appNotification.error("请输入图的维度(以英文分号分隔,不可有空格)");
    } else if (
      !this.addData.chartValueIndex ||
      (this.addData.chartValueIndex &&
        !this.regDH1.test(this.addData.chartValueIndex)) ||
      (this.addData.chartValueIndex &&
        this.spaceAny.test(this.addData.chartValueIndex))
    ) {
      this.appNotification.error("请输入图的指标(以英文分号分隔,不可有空格)");
    } else if (!this.addData.chartNameShow) {
      this.appNotification.error("请选择维度显示");
    } else if (
      !this.addData.defaultTimeStart ||
      !this.addData.defaultTimeEnd ||
      (this.addData.defaultTimeStart &&
        !this.onlyNumberReg.test(this.addData.defaultTimeStart)) ||
      (this.addData.defaultTimeEnd &&
        !this.onlyNumberReg.test(this.addData.defaultTimeEnd))
    ) {
      this.appNotification.error("请输入默认时间(仅限数字)");
    } else if (
      this.addData.defaultTimeStart &&
      this.addData.defaultTimeEnd &&
      parseInt(this.addData.defaultTimeStart) <
        parseInt(this.addData.defaultTimeEnd)
    ) {
      this.appNotification.error("请输入默认时间(后者时间不得大于前者时间)");
    } else if (!this.addData.status) {
      this.appNotification.error("请选择启用状态");
    } else if (
      (this.addData.attrFilter && !this.regFH3.test(this.addData.attrFilter)) ||
      (this.addData.attrFilter && this.spaceAny.test(this.addData.attrFilter))
    ) {
      this.appNotification.error("请输入过滤属性(请参照用例)(不可有空格)");
    } else if (
      !this.addData.dataSql ||
      (this.addData.dataSql && this.space.test(this.addData.dataSql))
    ) {
      this.appNotification.error("请输入SQL(首尾不可有空格)");
    } else {
      if (this.addData.headName) {
        this.addData.headName = this.addData.headName.replace(/[;；]/g, ";");
      }
      if (this.addData.attrFilter) {
        this.addData.attrFilter = this.addData.attrFilter.replace(/[;；]/g,";");
      }
      this.addData.status = parseInt(this.addData.status);
      this.addData.chartNameShow = parseInt(this.addData.chartNameShow);
      this.addData.defaultTime =
        this.addData.defaultTimeStart + ":" + this.addData.defaultTimeEnd;
      delete this.addData.defaultTimeStart;
      delete this.addData.defaultTimeEnd;
      if (this.addData.id) {
        // this.addData.id = this.addData.id;
        this.configService.updateTableList(this.addData).subscribe(
          response => {
            if (response && !response.data) {
              this.handleCancel();
              this.updataList();
            } else {
              this.appNotification.error(response.data);
            }
          },
          response => {
            this.appNotification.error(response.error.errorMsg);
          }
        );
      } else {
        this.configService.addTableList(this.addData).subscribe(
          response => {
            if (response && !response.data) {
              this.handleCancel();
              this.updataList();
            } else {
              this.appNotification.error(response.data);
            }
          },
          response => {
            this.appNotification.error(response.error.errorMsg);
          }
        );
      }
    }
  }

  updataList() {
    if (!this.searchKey) {
      this.searchFun("");
    } else {
      this.searchFun(this.searchKey);
    }
  }

  delete(item) {
    this.configService.deleteTableList(item).subscribe(
      response => {
        this.searchList = this.searchList.filter(temp => {
          return item != temp.id;
        });
        this.searchList = [].concat(this.searchList);
        this.updataList();
      },
      response => {
        this.appNotification.error(response.error.errorMsg);
      }
    );
  }
}
