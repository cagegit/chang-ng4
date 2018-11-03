import { Component, ViewChild, OnInit } from "@angular/core";
import { ProtocolService } from "./protocol.service";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import { flyInOut } from "../../animations";
// import { NzMessageService } from "ng-zorro-antd";
import { ProtocolDetailComponent } from "./protocol-detail.component";
import { resolve } from "path";
@Component({
  templateUrl: "./protocol-config.component.html",
  styleUrls: ["./protocol.component.css"],
  animations: [flyInOut]
})
export class ProtocolConfigComponent implements OnInit {
  @ViewChild("protocolDetail")
  protocolDetail: ProtocolDetailComponent;
  datalist: Array<any> = [];
  searchList: Array<any> = [];
  currentData: any = {};
  dataItem = {};
  searchDataName = {};
  typeEnum: Array<any> = [];
  ruleNoEnum: Array<any> = [];
  currentIndex: any;
  flag: boolean = false;
  showDetail: boolean = false;
  hideModel: boolean = false;
  showModel: boolean = false;
  title: string;
  private numberRegex = /^\d{2,6}$/;
  private regex = new RegExp(
    "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？《》]"
  );

  searchProtocolKey: string;
  addData: any = {
    name: "",
    ruleNo: "",
    type: "",
    port: "",
    notes: "",
    id: ""
  };
  originData: any = {
    name: "",
    ruleNo: "",
    type: "",
    port: "",
    notes: "",
    id: ""
  };
  constructor(
    private protocolService: ProtocolService,
    private appNotification: AppNotification,
  ) {}
  ngOnInit() {
    // console.log(this.numberRegex.test('2222'));
    this.typeEnum = [
      { id: 2, name: "终端通讯协议" },
      { id: 1, name: "平台间通讯协议" }
    ];
    this.ruleNoEnum = [{ id: 1, name: "国标" }, { id: 2, name: "北京地标" }];
    this.getProtocolAllList();
  }

  getProtocolAllList() {
    //查询数据
    this.protocolService.getProtocolList().subscribe(
      response => {
        
        if (response && response.json().data && Array.isArray(response.json().data)) {
          this.searchList.length = 0;
          let data = response.json().data;
          this.searchList = [].concat(data);
          if (this.searchList && this.searchList.length !== 0) {
            this.clickFun(this.searchList[0]);
          }
        }
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  searchFun(value) {
    // console.log(value);
    //查询数据
    // console.log(this.searchList);
    this.protocolService.getProtocolListByName(value).subscribe(
      response => {
        if (response && response.json().data && Array.isArray(response.json().data)) {
          this.searchList = [];
          let data = response.json().data;
          this.searchList = [].concat(data);
        }
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  clickFun(value) {
    this.currentIndex = "";
    this.currentIndex = value.id;
    // console.log(value);
    // this.currentData = value;
    this.currentData = JSON.parse(JSON.stringify(value));
    // console.log(this.currentData);
    this.currentData.typeName =
      this.currentData.type === 1 ? "平台间通讯协议" : "终端通讯协议";
    this.currentData.roleName =
      this.currentData.ruleNo === 1 ? "国标" : "北京地标";
    this.showDetail = true;
    this.protocolDetail.getDataList("", value.id);
    this.protocolDetail.clearSearchKey();
  }

  onChangeType(value: string) {
    this.addData.type = value;
    // console.log(value);
  }

  onChangeruleNo(value: string) {
    this.addData.ruleNo = value;
    // console.log(value);
  }

  onChangePort(value: string) {
    // console.log(value);
    this.addData.port = value;
  }

  show(flag, data) {
    // console.log(flag);
    this.showModel = true;
    // this.addModal.show();
    if (flag == "add") {
      this.flag = false;
      this.addData = {};
      this.title = "新增协议";
    } else {
      this.flag = true;
      // this.addData = data;
      this.addData = JSON.parse(JSON.stringify(data));
      this.originData = JSON.parse(JSON.stringify(data));
      this.title = "编辑协议";
    }
  }

  handleCancel() {
    this.showModel = false;
  }

  addProrocol() {
    if(this.addData.name){
      this.addData.name = this.addData.name.trim();
    }
    if (
      !this.addData.name ||
      (this.addData.name && this.addData.name.length < 2) ||
      (this.addData.name && this.addData.name.length > 20) ||
      (this.addData.name && this.regex.test(this.addData.name))
    ) {
      this.appNotification.error("请输入协议名称(2-20字符,特殊字符除外)");
    } else if (!this.addData.ruleNo) {
      this.appNotification.error("请输入规约号");
    } else if (!this.addData.type) {
      this.appNotification.error("请选择协议类型");
    } else if (
      (this.addData.type === 2 || this.addData.type === "2") &&
      !this.addData.port
    ) {
      this.appNotification.error("请输入端口");
    } else if (
      this.addData.port &&
      (!this.numberRegex.test(this.addData.port) ||
        this.addData.port.length < 2 ||
        this.addData.port.length > 6)
    ) {
      this.appNotification.error("请输入端口(2-6字符,仅限数字)");
    } else if (
      (this.addData.notes && this.addData.notes.length < 2) ||
      (this.addData.notes && this.addData.notes.length > 60)
    ) {
      this.appNotification.error("请输入备注(2-60字符)");
    } else {
      this.addData.type = parseInt(this.addData.type);
      this.addData.ruleNo = parseInt(this.addData.ruleNo);
      this.addData.name = this.addData.name.trim();
      if (this.addData.port && this.addData.type == 2) {
        this.addData.port = "" + this.addData.port;
        this.addData.port = this.addData.port.trim();
      }
      if (this.addData.notes) {
        this.addData.notes = this.addData.notes.trim();
      }
      if (this.addData && this.addData.id) {
        this.protocolService.updateProtocolAPi(this.addData).subscribe(
          response => {
            let status = response.json().status;
            this.updataProtocolList();
            if (status === 200) {
              this.showModel = false;
            }
          },
          (response: Response) => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this.appNotification.error(message);
          }
        );
      } else {
        this.protocolService.addProtocolAPi(this.addData).subscribe(
          response => {
            let status = response.json().status;
            if (status === 200) {
              this.showModel = false;
            }
            this.updataProtocolList();
          },
          (response: Response) => {
            let message = DomainFactory.buildError(response.json()).errorMsg;
            this.appNotification.error(message);
          }
        );
      }
    }
  }

  updataProtocolList() {
    if (this.searchProtocolKey) {
      this.searchFun(this.searchProtocolKey);
    } else {
      this.getProtocolAllList();
    }
  }

  deleteProtocol(item) {
    this.hideModel = true;
    // console.info("删除", item);
    this.protocolService.deleteProtocolApi(item).subscribe(
      response => {
        this.searchList = this.searchList.filter(temp => {
          // console.log(temp);
          return item != temp.id;
        });
        this.searchList = [].concat(this.searchList);
        // console.log(this.searchList);
        this.updataProtocolList();
        this.currentData = {};
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  clear() {
    // console.log(this.addData);
    if (this.addData && this.addData.id) {
      this.addData = JSON.parse(JSON.stringify(this.originData));
    } else {
      this.addData = {};
    }
  }
}
