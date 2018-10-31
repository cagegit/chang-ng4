import {
  Component,
  Input,
  OnInit
} from "@angular/core";
import { ProtocolService } from "./protocol.service";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "protocol-detail",
  templateUrl: "./protocol-detail.component.html",
  styleUrls: ["./protocol.component.css"]
})
export class ProtocolDetailComponent implements OnInit {
  @Input()
  data;
  // @ViewChild("addDataModal")
  // addDataModal;
  dataItem: Array<any> = [];
  dataItemAll: Array<any> = [];
  originDataItemAll: Array<any> = [];
  searchKey: string;
  searchDataName: any = {};
  searchProtocolKey: string;
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _loading = false;
  isVisible = false;
  constructor(
    private protocolService: ProtocolService,
    private appNotification: AppNotification,
    private _message: NzMessageService
  ) {
    // console.log(this.data);
  }
  // ngAfterViewInit(){
  //   this.getDataList("");
  // }
  ngOnInit() {
    // this.getDataList(this.data.id, "");
    this.searchKey = this.searchKey ? this.searchKey : "";
  }

  //show 数据项model
  showDataItemModel(value) {
    this.dataItemAll = [];
    this.getDataAllList(value.id);
    this.isVisible = true;
  }

  handleCancel(){
    this.isVisible = false;
  }

  //按项目名称搜索
  searchDataItem(value) {
    this.getDataList(value,this.data.id);
  }

  //清空搜索项
  clearSearchKey(){
    this.searchKey = '';
  }

  //已分配数据项
  getDataList(itemName,id) {
    this.dataItem = [];
    this._loading = true;
    this.protocolService.getDataListByName(id, itemName).subscribe(
      response => {
        let data = response.json().data;
        data.forEach(item => {
          this.dataItem.push(item);
        });
        this._current = 1;
        this._total = response.json().data.length;
        this._loading = false;
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //删除数据项
  deleteDataItem(id) {
    // console.log(this.data);
    let data = { dataitemId: id, protocolId: this.data.id };
    // console.log(data);
    this.protocolService.deleteDataItemApi(data).subscribe(
      response => {
        this.searchKey = this.searchKey ? this.searchKey : "";
        this.getDataList(this.searchKey,this.data.id);
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //all数据项
  getDataAllList(id) {
    this.protocolService.getDataAllList(id).subscribe(
      response => {
        this.originDataItemAll = [];
        let data = response.json().data;
        data.forEach(item => {
          item.isAssigned = item.isAssigned === 1 ? true : false;
          item.checked = item.isAssigned;
          this.dataItemAll.push(item);
          this.originDataItemAll.push(item);
        });
      },
      (response: Response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //按数据项名称筛选
  searchData(value) {
    if (value) {
      this.dataItemAll = [];
      this.dataItemAll = this.originDataItemAll.filter(temp => {
        return temp.name.indexOf(value) > -1;
      });
    } else {
      this.dataItemAll = [];
      this.originDataItemAll.forEach(item => {
        this.dataItemAll.push(item);
      });
    }
  }

  //是否选中数据项
  changeCheckedState(e, index) {
    this.dataItemAll[index].isAssigned = e.target.checked;
  }

  //保存数据项
  onSubmit() {
    let dataItemIds: Array<any> = [];
    this.dataItemAll.forEach(item => {
      // console.log(item);
      if (item.isAssigned) {
        dataItemIds.push(item.id);
      }
      // item.isAssigned = item.isAssigned?1:0;
    });
    let data = {
      protocolId: this.data.id,
      dataitemId: dataItemIds.join(",")
    };
    // console.log(data);
    if (dataItemIds && dataItemIds.length !== 0) {
      this.protocolService.saveDataItem(data).subscribe(
        (response: Response) => {
          // this.addDataModal.hide();
          this.isVisible = false;
          this.searchKey = this.searchKey ? this.searchKey : "";
          this.getDataList(this.searchKey,this.data.id);
        },
        (response: Response) => {
          let message = DomainFactory.buildError(response.json()).errorMsg;
          this.appNotification.error(message);
        }
      );
    } else {
      this.appNotification.error("请选择数据项");
    }
  }

  //重置
  clearData() {
    this.searchDataName.name = "";
    this.dataItemAll = [];
    this.getDataAllList(this.data.id);
  }
}
