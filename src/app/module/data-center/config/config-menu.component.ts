import { Component, AfterViewInit, Renderer, OnInit } from "@angular/core";
import { AppNotification } from "../../../app.notification";
import { ConfigService } from "./config.service";

@Component({
  templateUrl: "./config-menu.component.html",
  styleUrls: ["./config.component.css"]
})
export class ConfigMenuComponent implements OnInit, AfterViewInit {
  // @ViewChild("taskDetail") taskDetail:TaskDetailComponent;
  searchList: Array<any> = [];
  _dataSet: any;
  _tableSet: Array<any> = [];
  addData: any = {};
  originData: any = {};
  currentIndex: string;
  searchKey: string;
  isVisible = false;
  title: string;
  private regex = new RegExp(
    "[`~!@#$^&%*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？《》]"
  );
  private space = /(^\s+)|(\s+$)/;
  constructor(
    private renderer: Renderer,
    private appNotification: AppNotification,
    // private appNotification: NzMessageService,
    private configService: ConfigService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.searchFun("");
  }

  searchFun(value) {
    //查询数据
    this.configService.getMenuList(value).subscribe(
      response => {
        if (response && response.data && Array.isArray(response.data)) {
          this.searchList = response.data;
          if (
            this.searchList &&
            Array.isArray(this.searchList) &&
            this.searchList.length !== 0
          ) {
            this.clickFun(this.searchList[0]);
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
      this.title = "新增报表集";
      this.addData = {};
      this.addData.status = "1";
    } else {
      this.title = "编辑报表集";
      this.addData = JSON.parse(JSON.stringify(item));
      this.originData = JSON.parse(JSON.stringify(item));
      this.addData.status = this.addData.status + "";
    }
  }

  clear() {
    if (this.addData && this.addData.id) {
      this.addData = JSON.parse(JSON.stringify(this.originData));
      this.addData.status = this.addData.status + "";
    } else {
      this.addData = {};
      this.addData.status = "1";
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  clickFun(value) {
    this.currentIndex = "";
    if (value.id && value) {
      this.currentIndex = value.id;
      this.getDetailById(value.id);
    }
  }

  getDetailById(id) {
    this.configService.getMenuDetailById(id).subscribe(
      response => {
        if (response && response.data) {
          this._dataSet = response.data.menuInfo;
          if (Array.isArray(response.data.tableList)) {
            this._tableSet = response.data.tableList;
          } else {
            this._tableSet = [];
          }
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
      ((this.addData.name && this.regex.test(this.addData.name)) ||
        (this.addData.name && this.space.test(this.addData.name)))
    ) {
      this.appNotification.error(
        "请输入名称(2-20字符,特殊字符除外,首尾不可有空格)"
      );
    } else if (!this.addData.status) {
      this.appNotification.error("请选择启用状态");
    } else {
      this.addData.status = parseInt(this.addData.status);
      if (this.addData && this.addData.id) {
        this.configService.updateMenuList(this.addData).subscribe(
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
        this.configService.addMenuList(this.addData).subscribe(
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
    this.configService.deleteMenuList(item).subscribe(
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
