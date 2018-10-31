import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer,
  OnInit
} from "@angular/core";
import { ForwardService } from "./forward.service";
import { ProtocolService } from "../protocol/protocol.service";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import { NzMessageService } from "ng-zorro-antd";
import { flyInOut } from "../../animations";
import { TaskDetailComponent } from "./task-detail.component";
// import { computeMinHeight } from "../../common/service/compute-min-height";
import { platform } from "os";

@Component({
  templateUrl: "./task.component.html",
  styleUrls: ["./forward.component.css"],
  animations: [flyInOut]
})
export class TaskComponent implements OnInit, AfterViewInit {
  @ViewChild("addModal")
  addModal;
  @ViewChild("taskDetail")
  taskDetail: TaskDetailComponent;
  // @ViewChild("userright") userRight:ElementRef;
  datalist: Array<any> = [];
  searchList: Array<any> = [];
  protocolList: Array<any> = [];
  platformList: Array<any> = [];
  currentData = {};
  searchDataName = {};
  addData: any = {};
  originData: any = {};
  flag: boolean = false;
  showDetail: boolean = false;
  isVisible: boolean = false;
  title: string;
  currentIndex: string;
  searchKey: string;
  private regex = new RegExp(
    "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？《》]"
  );
  constructor(
    private renderer: Renderer,
    private forwardService: ForwardService,
    private appNotification: AppNotification,
    private protocolService: ProtocolService,
    private _message: NzMessageService
  ) {}

  ngOnInit() {}
  ngAfterViewInit() {
    // computeMinHeight.setMinHeight(this.renderer,this.userRight.nativeElement,true);
    this.searchFun("");
    this.getProtocolAllList();
    this.getPlatformList();
  }

  //all协议
  getProtocolAllList() {
    // console.log(this.protocolList);
    this.protocolService.getProtocolList().subscribe(
      response => {
        if (
          response &&
          response.json().data &&
          Array.isArray(response.json().data)
        ) {
          this.protocolList.length = 0;
          let data = response.json().data;
          this.protocolList = [].concat(data);
        }
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //all平台
  getPlatformList() {
    // console.log(this.platformList);
    this.forwardService.getPlatformListApi().subscribe(
      response => {
        if (
          response &&
          response.json().data &&
          Array.isArray(response.json().data)
        ) {
          this.platformList.length = 0;
          let data = response.json().data;
          this.platformList = [].concat(data);
        }
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //all转发平台

  searchFun(value) {
    //查询数据
    this.forwardService.getTaskListApi(value).subscribe(
      response => {
        this.searchList = [];
        let data = response.json().data;
        if (!data) {
          this.searchList = [];
        } else if (data && Array.isArray(data)) {
          this.searchList = [].concat(data);
          this.clickFun(this.searchList[0]);
          let nowTime = new Date();
          this.searchList.forEach(item => {
            item.isOverdue = false;
            item.protocolId = item.protocol.id;
            item.platformId = item.platform.id;
            if (item.isLongterm === 0) {
              if (new Date(item.expireDate).getTime() < nowTime.getTime()) {
                item.isOverdue = true;
              } else {
                item.isOverdue = false;
              }
              item.startDateFormat = item.startDate
                ? this.formatDate(item.startDate)
                : "";
              item.expireDateFormat = item.expireDate
                ? this.formatDate(item.expireDate)
                : "";
            } else {
              item.isOverdue = false;
            }
          });
        }
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  clickFun(value) {
    this.currentIndex = "";
    if(value) {
      this.currentIndex = value.id;
      this.currentData = value;
      this.taskDetail.resetForm();
      this.taskDetail.search(value.id);
    }
  }

  show(flag, data) {
    this.isVisible = true;
    if (flag == "add") {
      this.flag = false;
      this.addData = {};
      this.title = "新增转发任务";
    } else {
      this.addData = JSON.parse(JSON.stringify(data));
      this.originData = JSON.parse(JSON.stringify(data));
      this.flag = false;
      if (this.addData.platform && this.addData.protocol) {
        this.flag = true;
      }
      this.title = "编辑转发任务";
      this.addData.isLongterm = this.addData.isLongterm === 1 ? true : false;
      this.addData.isEncrypt = this.addData.isEncrypt + "";
      this.addData.isEnable = this.addData.isEnable + "";
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  //长期切换
  isLongtermChange(value) {
    if (value.checked) {
      this.addData.startDate = "";
      this.addData.expireDate = "";
    }
  }

  submit() {
    if (this.addData.name) {
      this.addData.name = this.addData.name.trim();
    }
    if (this.addData.notes) {
      this.addData.notes = this.addData.notes.trim();
    }
    if (
      !this.addData.name ||
      (this.addData.name && this.addData.name.length < 2) ||
      (this.addData.name && this.addData.name.length > 20) ||
      (this.addData.name && this.regex.test(this.addData.name))
    ) {
      this._message.error("请输入任务名称(2-20字符,特殊字符除外)");
    } else if (!this.addData.platformId) {
      this._message.error("请选择目标平台");
    } else if (!this.addData.protocolId) {
      this._message.error("请选择转发协议");
    } else if (
      !this.addData.isLongterm &&
      (!this.addData.startDate || !this.addData.expireDate)
    ) {
      this._message.error("请选择有效期");
    } else if (
      !this.addData.isLongterm &&
      !this.addData.startDate &&
      !this.addData.expireDate
    ) {
      this._message.error("请选择有效期");
    } else if (
      this.addData.startDate &&
      this.addData.expireDate &&
      new Date(this.addData.startDate).getTime() >=
        new Date(this.addData.expireDate).getTime()
    ) {
      this._message.error("请选择有效期(开始时间不能大于结束时间)");
    } else if (!this.addData.isEncrypt) {
      this._message.error("请选择传输加密");
    } else if (!this.addData.isEnable) {
      this._message.error("请选择任务状态");
    } else if (
      (this.addData.notes && this.addData.notes.length < 2) ||
      (this.addData.notes && this.addData.notes.length > 60)
    ) {
      this._message.error("请输入备注(2-60字符)");
    } else {
      this.addData.name = this.addData.name.trim();
      if (this.addData.notes) {
        this.addData.notes = this.addData.notes.trim();
      }
      this.addData.isEnable = parseInt(this.addData.isEnable);
      this.addData.isEncrypt = parseInt(this.addData.isEncrypt);
      this.addData.isLongterm = this.addData.isLongterm ? 1 : 0;
      this.addData.startDates = this.formatDate(this.addData.startDate);
      this.addData.expireDates = this.formatDate(this.addData.expireDate);
      delete this.addData.isOverdue;
      delete this.addData.vehicles;
      if (this.addData.isLongterm === 1) {
        delete this.addData.startDates;
        delete this.addData.expireDates;
        delete this.addData.expireDateFormat;
        delete this.addData.startDateFormat;
      }
      let data;
      if (this.addData.isLongterm === 1) {
        data = {
          // id: this.addData.id,
          name: this.addData.name,
          platformId: this.addData.platformId,
          protocolId: this.addData.protocolId,
          isLongterm: this.addData.isLongterm,
          isEncrypt: this.addData.isEncrypt,
          isEnable: this.addData.isEnable,
          notes: this.addData.notes
        };
      } else {
        data = {
          // id: this.addData.id,
          name: this.addData.name,
          platformId: this.addData.platformId,
          protocolId: this.addData.protocolId,
          isLongterm: this.addData.isLongterm,
          startDate: this.addData.startDates,
          expireDate: this.addData.expireDates,
          isEncrypt: this.addData.isEncrypt,
          isEnable: this.addData.isEnable,
          notes: this.addData.notes
        };
      }
      if (this.addData && this.addData.id) {
        data.id = this.addData.id;
        this.forwardService.updateTaskAPi(data).subscribe(
          response => {
            this.handleCancel();
            this.updataList();
          },
          response => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this._message.error(response.json().errorMsg);
          }
        );
      } else {
        this.forwardService.addTaskAPi(data).subscribe(
          response => {
            this.handleCancel();
            this.updataList();
          },
          response => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this.appNotification.error(message);
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
    // console.log(JSON.parse(item));
    let platformId;
    this.searchList.forEach(list => {
      if (list.id == item) {
        platformId = list.platformId;
      }
    });
    if (platformId) {
      this.forwardService.deleteTaskApi(item, platformId).subscribe(
        response => {
          this.searchList = this.searchList.filter(temp => {
            return item != temp.id;
          });
          this.searchList = [].concat(this.searchList);
          this.updataList();
          this.currentData = {};
        },
        response => {
          let message = DomainFactory.buildError(response.json()).errorMsg;
          this._message.error(message);
        }
      );
    }
  }

  clear() {
    if (this.addData && this.addData.id) {
      this.addData = JSON.parse(JSON.stringify(this.originData));
      this.addData.isLongterm = this.addData.isLongterm === 1 ? true : false;
      this.addData.isEncrypt = this.addData.isEncrypt + "";
      this.addData.isEnable = this.addData.isEnable + "";
    } else {
      this.addData = {};
    }
  }

  formatDate(value) {
    let date = "";
    let dateObj = new Date(value);
    date =
      dateObj.getFullYear() +
      "-" +
      this.backTwoNum(dateObj.getMonth() + 1) +
      "-" +
      this.backTwoNum(dateObj.getDate()) +
      " ";
    date +=
      this.backTwoNum(dateObj.getHours()) +
      ":" +
      this.backTwoNum(dateObj.getMinutes()) +
      ":" +
      this.backTwoNum(dateObj.getSeconds());
    date += "";
    return date;
  }

  backTwoNum(n: number): string {
    if (n < 10) {
      return "0" + n;
    } else {
      return n.toString();
    }
  }
}
