import {
  Component,
  AfterViewInit,
  Renderer,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { ConfigService } from "./config.service";
import { AppNotification } from "../../../app.notification";

@Component({
  selector: "table-detail",
  templateUrl: "./table-detail.component.html",
  styleUrls: ["./config.component.css"]
})
export class TableDetailComponent implements AfterViewInit {
  @Input()
  tableInfo;
  @Input()
  tablelist;
  _dataSet: Array<any> = [];
  _dataSetOrigin: Array<any> = [];
  @Output()
  change: EventEmitter<any> = new EventEmitter();
  editer = {
    name: false,
    status: false
  };
  searchDataName = {
    name: ""
  };
  isVisible = false;
  constructor(
    private renderer: Renderer,
    private _message: NzMessageService,
    private appNotification: AppNotification,
    private configService: ConfigService // private fb: FormBuilder
  ) {}

  ngAfterViewInit() {
    // console.log(this.tableInfo);
  }

  show() {
    this.isVisible = true;
    this.searchDataName.name = "";
    this._dataSet = [];
    this.getDetailById(this.tableInfo.id);
  }

  getDetailById(id) {
    this.configService.getMenuByTableId(id).subscribe(
      response => {
        if (response && response.data) {
          // console.log(response);
          // console.log(Array.isArray(response.data.assMenuList));
          if (Array.isArray(response.data.assMenuList)) {
            response.data.assMenuList.forEach(item => {
              item.checked = true;
              item.isAssigned = true;
              this._dataSet.push(item);
            });
          }
          if (Array.isArray(response.data.unAssMenuList)) {
            response.data.unAssMenuList.forEach(item => {
              item.checked = false;
              this._dataSet.push(item);
            });
          }
          this._dataSetOrigin = JSON.parse(JSON.stringify(this._dataSet));
          // console.log(this._dataSet);
        }
      },
      response => {
        this.appNotification.error(response.error.errorMsg);
      }
    );
  }
  //是否选中数据项
  changeCheckedState(e, index) {
    this._dataSet[index].checked = e.target.checked;
  }

  //搜索报名mc筛选
  searchFun(value) {
    if (value) {
      this._dataSet = [];
      this._dataSet = this._dataSetOrigin.filter(temp => {
        return temp.name.indexOf(value) > -1;
      });
    } else {
      this._dataSet = [];
      this._dataSetOrigin.forEach(item => {
        this._dataSet.push(item);
      });
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  //分配菜单
  onSubmit() {
    let canSave = false;
    let tableId = this.tableInfo.id;
    let data = [];
    this._dataSet.forEach(item => {
      if (item.checked) {
        canSave = true;
        data.push({ tableId: tableId, menuId: item.id });
      }
    });
    if (canSave) {
      this.configService.assMenuAndTableByTableId(data).subscribe(
        response => {
          if (response && !response.data) {
            this.handleCancel();
            this.change.emit();
          }
        },
        response => {
          this.appNotification.error(response.error.errorMsg);
        }
      );
    } else {
      this.appNotification.error("请选择菜单");
    }
  }

  clearData() {
    this.searchDataName.name = "";
    this._dataSet = [];
    this.getDetailById(this.tableInfo.id);
  }
}
