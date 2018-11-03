import {Component, ViewChild, OnInit} from "@angular/core";
import { ForwardService } from "./forward.service";
// import { ModalDirective } from "ng2-bootstrap";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import { flyInOut } from "../../animations";
// import { NzMessageService } from "ng-zorro-antd";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  templateUrl: "./forward-config.component.html",
  styleUrls: ["./forward.component.css"],
  animations: [flyInOut]
})
export class ForwardConfigComponent implements OnInit {
  addData:any = {};
  originData:any = {};
  searchData:any = {};
  priorityEnum: Array<any> = [];
  forwardModeEnum: Array<any> = [];
  staticForwardPlatformEnum: Array<any> = [];
  dataItem: Array<any> = [];
  flag: boolean = false;
  preview: boolean = false;
  priority: boolean = false;
  unitName: boolean = false;
  title: string;
  totalIndex: number;
  currentIndex: number = 1;
  public validateForm: FormGroup;
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = false;
  isVisible = false;
  isVisibles = false;
  params;
  private  regex = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？《》]");

  private en = /[\u4e00-\u9fa5]/im;

  constructor(
    private forwardService: ForwardService,
    private appNotification: AppNotification,
    // private appNotification: NzMessageService,
    private fb: FormBuilder
  ) {
    this.validateForm = fb.group({
      unitName: [null],
      address: [null],
      forwardMode: [null]
    });
  }
  ngOnInit () {
    this.search();
    this.priorityEnum = [
      { id: 3, name: "高级" },
      { id: 2, name: "中级" },
      { id: 1, name: "低级" }
    ];
    this.forwardModeEnum = [{ id: 1, name: "WS" }, { id: 2, name: "SOCKET" }];
    this.staticForwardPlatformEnum = [{ id: 0, name: "无" }, { id: 1, name: "上海平台" }];
  }

  search() {
    this.params = this.validateForm.value;
    this.refreshData(true);
  }
  // 刷新数据
  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    this._loading = true;
    let data = {
      address: this.params.address || "",
      unitName: this.params.unitName || "",
      forwardMode: this.params.forwardMode || "",
      limit: this._pageSize,
      start: this._current
    };
    this.forwardService.getListApi(data).subscribe((res: any) => {
      if(res) {
        this._total = res.json().data.total;
        this._dataSet =res.json().data.list;
      }
      this._loading = false;
    },(res:Response) => {
      let message = DomainFactory.buildError(res).errorMsg;
      this.appNotification.error(message);
      this._loading = false;
    });
  };

  resetForm() {
    this.validateForm.reset();
  }
  //show新增model
  show(flag, data) {
    this.preview = false;
    this.priority = false;
    this.flag = false;
    // this.addModal.show();
    this.isVisible = true;
    if (flag == "add") {
      this.addData = {};
      this.addData['forwardMode'] = "SOCKET";
      this.addData['staticForwardPlatform'] = "无";
      this.title = "新增目标平台配置";
      this.addData.priority = "1";
    } else if (flag == "edit") {
      this.flag = true;
      this.addData = JSON.parse(JSON.stringify(data));
      this.originData = JSON.parse(JSON.stringify(data));
      this.unitName = true;
      if (this.addData.priority) {
        this.priority = true;
      }
      this.title = "编辑目标平台配置";
    } else {
      this.addData = data;
      this.title = "目标平台详情";
      this.preview = true;
      this.priorityEnum.forEach(item => {
        if(item.id==this.addData.priority){
          this.addData.priorityName = item.name;
        }
      });
    }
  }

  handleCancel(){
    this.isVisible  = false;
    // this.search();
  }

  deleteItem(){
    this.isVisibles  = true;
  }


  handleCancelItem(){
    this.isVisibles  = false;
  }

  //重置查询条件
  clearSearch() {
    this.searchData = {};
  }

  //重置新增数据
  clear() {
    if(this.addData && this.addData.id){
      this.addData = JSON.parse(JSON.stringify(this.originData));
    }else{
    this.addData = {};
    this.priority = false;
    this.addData.priority = "1";
    this.addData['forwardMode'] = "SOCKET";
    this.addData['staticForwardPlatform'] = "无";
    this.flag = false;
    }
  }

  //新增轉發配置
  submit() {
    if(this.addData.unitName){
      this.addData.unitName = this.addData.unitName.trim();
    }
    if(this.addData.username){
    this.addData.username = this.addData.username.trim();
    }
    if(this.addData.address){
      this.addData.address = this.addData.address.trim();
    }
    if(this.addData.nsPort){
      this.addData.nsPort = this.addData.nsPort.trim();
    }
    if(this.addData.password){
      this.addData.password = this.addData.password.trim();
    }
    if(this.addData.cdKey){
      this.addData.cdKey = this.addData.cdKey.trim();
    }
    if(this.addData.notes){
      this.addData.notes = this.addData.notes.trim();
    }
    if (!this.addData.unitName||(this.addData.unitName&&this.addData.unitName.length<2)||(this.addData.unitName&&this.addData.unitName.length>20)||(this.addData.unitName&&this.regex.test(this.addData.unitName))) {
      this.appNotification.error("请输入平台名称(2-20字符,特殊字符除外)");
    }else if (!this.addData.staticForwardPlatform) {
      this.appNotification.error("请选择静态推送");
    } else if (!this.addData.forwardMode) {
      this.appNotification.error("请选择转发方式");
    } else if (!this.addData.address||(this.addData.address&&this.addData.address.length<5)||(this.addData.address&&this.addData.address.length>60)||(this.addData.address&&this.en.test(this.addData.address))) {
      this.appNotification.error("请输入目的地址(5-60字符,中文除外)");
    } else if (!this.addData.nsPort||(this.addData.nsPort&&this.addData.nsPort.length<2)||(this.addData.nsPort&&this.addData.nsPort.length>60)||(this.addData.nsPort&&this.en.test(this.addData.nsPort))) {
      this.appNotification.error("请输入目的命名空间/端口(2-60字符,中文除外)");
    } else if (!this.addData.username||(this.addData.username&&this.addData.username.length<2)||(this.addData.username&&this.addData.username.length>20)||(this.addData.username&&this.en.test(this.addData.username))) {
      this.appNotification.error("请输入用户名(2-20字符,中文除外)");
    } else if (!this.addData.password||(this.addData.password&&this.addData.password.length<2)||(this.addData.password&&this.addData.password.length>100)||(this.addData.password&&this.en.test(this.addData.password))) {
      this.appNotification.error("请输入密码(2-100字符,中文除外)");
    }else if ((this.addData.cdKey&&this.addData.cdKey.length<2)||(this.addData.cdKey&&this.addData.cdKey.length>100)||(this.addData.cdKey&&this.en.test(this.addData.cdKey))) {
      this.appNotification.error("请输入唯一识别码(2-100字符,中文除外)");
    } else if ((this.addData.notes&&this.addData.notes.length<2)||(this.addData.notes&&this.addData.notes.length>60)) {
      this.appNotification.error("请输入备注(2-60字符)");
    } else {
      this.addData.unitName = this.addData.unitName.trim();
      this.addData.address = this.addData.address.trim();
      this.addData.nsPort = this.addData.nsPort.trim();
      this.addData.username = this.addData.username.trim();
      this.addData.password = this.addData.password.trim();
      if(this.addData.cdKey){
        this.addData.cdKey = this.addData.cdKey.trim();
      }
      if(this.addData.notes){
        this.addData.notes = this.addData.notes.trim();
      }
      if (this.addData && this.addData.id) {
        this.forwardService.updateAPi(this.addData).subscribe(
          (response) => {
            let status = response.json().status;
            if (status === 200) {
              this.handleCancel();
              this.search();
            }
          },
          (response) => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this.appNotification.error(message);
          }
        );
      } else {
        this.forwardService.addAPi(this.addData).subscribe(
          (response) => {
            this.handleCancel();
            this.search();
          },
          (response) => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this.appNotification.error(message);
          }
        );
      }
    }
  }

  //删除平台
  delete(item) {
    this.forwardService.deleteApi(item).subscribe(
      () => {
        this.search();
      },
      (response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }
}
