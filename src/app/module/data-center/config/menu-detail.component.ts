import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer,
  Input,
  OnInit,
  EventEmitter,
  Output
} from "@angular/core";
//   import { ForwardService } from "./forward.service";
//   import { AppNotification } from "../../app.notification";
//   import { DomainFactory } from "../../common/DomainFactory";
//   import { Pagination } from "../../common/model/pagination.model";
import { NzMessageService } from "ng-zorro-antd";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ConfigService } from "./config.service";
//   import { platform } from 'os';
import { DomainFactory } from "../../../common/DomainFactory";
import { AppNotification } from "../../../app.notification";

@Component({
  selector: "menu-detail",
  templateUrl: "./menu-detail.component.html",
  styleUrls: ["./config.component.css"]
})
export class MenuDetailComponent implements AfterViewInit {
  @Input()
  menuInfo;
  @Input()
  tablelist;
  @Output()
  change: EventEmitter<any> = new EventEmitter();
  _dataSet: Array<any> = [];
  _dataSetOrigin: Array<any> = [];
  editer = {
    name: false,
    status: false
  };
  searchDataName: any = {};
  isVisible = false;
  constructor(
    private renderer: Renderer,
    private _message: NzMessageService,
    private appNotification: AppNotification,
    private configService: ConfigService // private fb: FormBuilder
  ) {}

  ngAfterViewInit() {
    // console.log(this.menuInfo);
  }

  show() {
    this.isVisible = true;
    this.searchDataName.name = "";
    this._dataSet = [];
    this.getDetailById(this.menuInfo.id);
  }

  getDetailById(id) {
    this.configService.getTableByMenuId(id).subscribe(
      response => {
        if (response && response.data) {
          if (Array.isArray(response.data.assTableList)) {
            response.data.assTableList.forEach(item => {
              item.checked = true;
              item.isAssigned = true;
              this._dataSet.push(item);
            });
          }
          if (Array.isArray(response.data.unAssTableList)) {
            response.data.unAssTableList.forEach(item => {
              item.checked = false;
              this._dataSet.push(item);
            });
          }
          this._dataSetOrigin = JSON.parse(JSON.stringify(this._dataSet));
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

  //分配报表
  onSubmit() {
    let canSave = false;
    let menuId = this.menuInfo.id;
    let data = [];
    this._dataSet.forEach(item => {
      if (item.checked) {
        canSave = true;
        data.push({ tableId: item.id, menuId: menuId });
      }
    });
    if (canSave) {
      this.configService.assMenuAndTableByMenuId(data).subscribe(
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
      this.appNotification.error("请选择报表");
    }
  }

  clearData() {
    this.searchDataName.name = "";
    this._dataSet = [];
    this.getDetailById(this.menuInfo.id);
  }

  delete(item) {
    this.configService.deleteMenuTableItem(this.menuInfo.id, item).subscribe(
      response => {
        this._dataSet = this._dataSet.filter(temp => {
          return item != temp.id;
        });
        this._dataSet = [].concat(this._dataSet);
        this.change.emit();
      },
      response => {
        this.appNotification.error(response.error.errorMsg);
      }
    );
  }
}
