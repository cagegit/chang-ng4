import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer,
  Input,
  OnInit
} from "@angular/core";
import { ForwardService } from "./forward.service";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import { Pagination } from "../../common/model/pagination.model";
import { NzMessageService } from "ng-zorro-antd";
import { FormGroup, FormBuilder } from "@angular/forms";
import { platform } from "os";

@Component({
  selector: "task-detail",
  templateUrl: "./task-detail.component.html",
  styleUrls: ["./forward.component.css"]
})
export class TaskDetailComponent implements AfterViewInit {
  @Input()
  data;
  @ViewChild("addDataModal")
  addDataModal;
  @ViewChild("unFindModel")
  unFindModel;
  dataItem: Array<any> = [];
  dataItemAll: Array<any> = [];
  dataVehiclesItem: Array<any> = [];
  originDataItemAll: Array<any> = [];
  vendorEnum: Array<any> = [];
  vehiclesTotal: Number;
  searchDataVehicles = {};
  searchData: any = {};
  searchDataName = {};
  // taskId:number;
  checkAll: boolean = false;
  deleteVehicles: boolean = false;
  export: boolean = false;
  searchWay: string;
  public validateForm: FormGroup;
  pagination: Pagination = new Pagination(10, 1, 1);
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = false;
  params;
  constructor(
    private renderer: Renderer,
    private forwardService: ForwardService,
    private appNotification: AppNotification,
    private _message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.validateForm = fb.group({
      licensePlate: [null],
      vin: [null],
      vendor: [null]
    });
    // this.taskId = this.data.id;
  }

  ngAfterViewInit() {
    // this.search(this.data.id);
    //车辆厂商
    this.forwardService.getConfigDataApi("002").subscribe(
      response => {
        let data = response.json().data;
        data.forEach(item => {
          this.vendorEnum.push(item);
        });
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  search(id) {
    // console.log(id);
    this.checkAll = false;
    this.params = this.validateForm.value;
    this.refreshData(true, id);
    this.deleteVehicles = false;
    // this._dataSet = [];
  }
  // 刷新数据
  refreshData(reset = false, id) {
    if (reset) {
      this._current = 1;
    }
    this._loading = true;
    let taskId = id || this.data.id;
    let data = {
      // taskId:id||this.data.id,
      licensePlate: this.params.licensePlate || "",
      vin: this.params.vin || "",
      vendor: this.params.vendor || ""
    };
    // console.log(this.data);
    this.forwardService
      .getVehiclesListApi(data, this._current, this._pageSize, taskId)
      .subscribe(
        (res: any) => {
          // console.log(res);
          if (res) {
            this._total = res.json().data.total;
            this._dataSet = res.json().data.list;
          }
          this._loading = false;
        },
        (res: Response) => {
          let message = DomainFactory.buildError(res).errorMsg;
          this.appNotification.error(message);
        }
      );
  }

  resetForm() {
    this.validateForm.reset();
  }

  //全选
  checkAllChange(value) {
    // console.log(value.checked);
    if (value.checked) {
      this._dataSet.forEach(item => {
        item.check = true;
        this.deleteVehicles = true;
      });
    } else {
      this._dataSet.forEach(item => {
        item.check = false;
        this.deleteVehicles = false;
      });
    }
  }

  //单选
  checkChange() {
    let index = 0;
    this.deleteVehicles = false;
    this._dataSet.forEach(item => {
      if (!item.check) {
        this.checkAll = false;
      } else {
        index++;
      }
      if (index === this._dataSet.length) {
        this.checkAll = true;
      }
      if (index > 0) {
        this.deleteVehicles = true;
      }
    });
  }

  //导出车辆
  exportVehicle() {
    console.log(this.data);
    this.export = true;
    let id = this.data.id;
    let taskName = this.data.name;
    let platformName = this.data.platform.unitName;
    let data = {
      licensePlate: this.validateForm.value.licensePlate || "",
      vin: this.validateForm.value.vin || "",
      vendor: this.validateForm.value.vendor || ""
    };
    this.forwardService
      .exportVehiclesListApi(data, id, taskName, platformName)
      .subscribe(
        response => {
          this.export = false;
        },
        response => {
          this.export = false;
          let message = DomainFactory.buildError(response.json()).errorMsg;
          this.appNotification.error(message);
        }
      );
  }

  //删除任务车辆
  deleteDataItem() {
    let vehicleIds: Array<any> = [];
    this._dataSet.forEach(item => {
      if (item.check) {
        vehicleIds.push(item.id);
      }
    });
    let data = {
      taskId: this.data.id,
      platformId: this.data.platform.id,
      vehicleIds: vehicleIds.join(",")
    };
    this.forwardService.deleteVehiclesApi(data).subscribe(
      response => {
        this.search("");
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }
}
