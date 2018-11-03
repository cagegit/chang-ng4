import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  Renderer,
  Input,
  AfterViewInit
} from "@angular/core";
// import { ModalDirective } from "ng2-bootstrap";
import { ForwardService } from "./forward.service";
import { AppNotification } from "../../app.notification";
import { DomainFactory } from "../../common/DomainFactory";
import {CHANG} from "../CFG_CHANG";
import { NzMessageService } from "ng-zorro-antd";
import { UploaderToolComponent } from "../components/uploader-tool.component";
import { FormGroup, FormBuilder } from "@angular/forms";
import { NzModalService } from "ng-zorro-antd";
import { Response } from "@angular/http";
import { OnInit } from "@angular/core";
import { ChangService } from "../chang.service";

@Component({
  selector: "task-vehicle",
  styleUrls: ["./forward.component.css"],
  templateUrl: "./task-vehicle.component.html"
})
export class TaskVehicleComponent implements OnInit, AfterViewInit {
  @ViewChild("uploader")
  uploaderTool: UploaderToolComponent;
  @Input()
  data;
  @Output()
  change: EventEmitter<any> = new EventEmitter();
  searchDataVehicles: any = {};
  vendorEnum: Array<any> = [];
  operatingCompanyEnum: Array<any> = [];
  vehicleTypeEnum: Array<any> = [];
  vehicleModeEnum: Array<any> = [];
  provinceEnum: Array<any> = [];
  cityEnum: Array<any> = [];
  existVehicle: Array<any> = [];
  insertCount: number;
  existVehicleCount: number;
  existVehicleDownLoadUrl: any;
  unExistCount: number;
  public validateForm: FormGroup;
  // importFindText:string;
  isFinding = false;
  importFindText = "数据查询中，请耐心等候"; // 导入查询的提示
  daochu$;
  findingData$;
  public tabs = [
    {
      name: "条件查询"
    },
    {
      name: "导入查询"
    }
  ];
  public currentTabIndex = 0;
  _current = 1;
  _pageSize = 10;
  _pageSize2 = 10;
  _total = 1;
  _dataSet = [];
  _dataSet2 = [];
  _loading = false;
  isVisible = false;
  saveAllVehicles = false;
  isTip = false;
  isSelect = false;
  // 上传部分
  uploadUrl = CHANG.API.FORWARDVEHICLE + "/importToSearchVehicles";
  params;
  deleteVehicles;
  checkAll: boolean = false;
  constructor(
    private renderer: Renderer,
    private forwardService: ForwardService,
    private appNotification: AppNotification,
    private fb: FormBuilder,
    private successModel: NzModalService,
    private changSer: ChangService
  ) {
    this.validateForm = fb.group({
      licensePlate: "",
      vendor: "",
      operatingCompany: "",
      vehType: "",
      vehModelNo: "",
      province: "",
      city: "",
      vin: ""
    });
  }

  ngOnInit() {
    this.validateForm.valueChanges.subscribe(data =>
      this.changeProvince(data.province)
    );
  }

  ngAfterViewInit() {
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
    //运营公司
    this.forwardService.getConfigDataApi("001").subscribe(
      response => {
        let data = response.json().data;
        data.forEach(item => {
          this.operatingCompanyEnum.push(item);
        });
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
    //车辆种类
    this.forwardService.getConfigDataApi("003").subscribe(
      response => {
        let data = response.json().data;
        data.forEach(item => {
          this.vehicleTypeEnum.push(item);
        });
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
    //省份
    this.forwardService.getConfigDataApi("004").subscribe(
      response => {
        let data = response.json().data;
        data.forEach(item => {
          this.provinceEnum.push(item);
        });
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  ngOnDestroy() {
    if (this.daochu$) {
      this.daochu$.unsubscribe();
    }
    if (this.findingData$) {
      this.findingData$.unsubscribe();
    }
  }

  open() {
    this.currentTabIndex = 0;
    this.isVisible = true;
    this.nzSelect();
  }

  searchData() {
    this.params = this.validateForm.value;
    this.refreshData(true);
    this.checkAll = false;
  }
  // 刷新数据
  refreshData(reset = false) {
    this.checkAll = false;
    if (reset) {
      this._current = 1;
    }
    this._loading = true;
    let data = {
      licensePlate: this.params.licensePlate,
      vin: this.params.vin,
      vendor: this.params.vendor,
      operatingCompany: this.params.operatingCompany,
      vehType: this.params.vehType,
      vehModelNo: this.params.vehModelNo,
      city: this.params.city
    };
    this.forwardService
      .getVehiclesApi(data, this._current, this._pageSize)
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

  handleCancel() {
    this.isVisible = false;
  }

  handleCancels() {
    this.isTip = false;
    this.change.emit();
  }

  handleCancelSelect() {
    this.isSelect = false;
    this.change.emit();
  }

  //省份切换获取城市
  changeProvince(value) {
    // console.log(value);
    this.forwardService.getCityApi(value).subscribe(
      response => {
        let data = response.json().data;
        this.cityEnum = data;
        if (this.cityEnum && this.cityEnum.length !== 0) {
          this.validateForm.value.city = this.cityEnum[0].id;
        }
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //全选
  checkAllChange(value) {
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

  nzSelect() {
    this._dataSet = [];
    this.checkAll = false;
    this.resetForm();
    this._total = 0;
    this.resetUploadForm();
    this.deleteVehicles = false;
    this.saveAllVehicles = false;
  }

  //添加选中
  saveSelect() {
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
    this.existVehicleCount = 0;
    this.forwardService.getVehicleApi(data).subscribe(
      response => {
        this.handleCancel();
        this.isSelect = true;
        this.insertCount = response.json().data.insertCount;
        if (
          response.json().data.existVehicle &&
          response.json().data.existVehicle.length !== 0
        ) {
          this.existVehicleCount = response.json().data.existVehicle.length;
          this.existVehicle = response.json().data.existVehicle;
        }
      },
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //添加all 按查询条件
  saveAll() {
    this.saveAllVehicles = true;
    this.params = this.validateForm.value;
    let data = {
      licensePlate: this.params.licensePlate,
      vin: this.params.vin,
      vendor: this.params.vendor,
      operatingCompany: this.params.operatingCompany,
      vehType: this.params.vehType,
      vehModelNo: this.params.vehModelNo,
      city: this.params.city
    };
    let taskId = this.data.id;
    let platformId = this.data.platform.id;
    this.existVehicleCount = 0;
    this.forwardService
      .getVehicleAllApiBySearch(data, taskId, platformId)
      .subscribe(
        response => {
          // console.log(res.json().data);
          let res = response.json();
          if (res && res.status === 200 && res.data) {
            const { done, callback } = res.data;
            let lunUrl = "";
            if (done) {
              // console.log(res.data);
            } else {
              if (callback) {
                let u = callback.replace(/^\/[^\/]*/, "");
                lunUrl = CHANG.API.ForwardVehicle + u;
                // if (importCount > 1000) {
                //   this.importFindText =
                //     "查询数据量大，查询时间可能较长，请耐心等待";
                // } else {
                //   this.importFindText = "数据查询中，请耐心等待";
                // }
                // this.isFinding = true;
                this.changSer.repeatOutput(lunUrl).subscribe(
                  res => {
                    if (
                      res &&
                      res.status === 200 &&
                      res.data &&
                      res.data.result
                    ) {
                      this.saveAllVehicles = false;
                      this.handleCancel();
                      this.isTip = true;
                      this.insertCount = res.data.result.insertCount;
                      this.existVehicleCount = res.data.result.existCount;
                      let existVehicleDownLoadUrl = res.data.result.existVehicleDownLoadUrl.split('/file')[1];
                      this.existVehicleDownLoadUrl = CHANG.API.FILE + existVehicleDownLoadUrl;
                    }
                  },
                  err => {
                    console.log(err);
                    this.isFinding = false;
                  }
                );
              }
            }
          }
        },
        response => {
          this.saveAllVehicles = false;
          let message = DomainFactory.buildError(response.json()).errorMsg;
          this.appNotification.error(message);
        }
      );
  }

  //导出重复车辆
  exportExistVehicle() {
    let data = {
      vehicles: this.existVehicle
    };
    this.forwardService.exportExistVehicleApi(data).subscribe(
      response => {},
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //导出未找到车辆
  exportUnExistVehicle() {
    // console.log(this.existVehicle);
    let dataObj = [];
    this.existVehicle.forEach(item => {
      let obj = {
        vin: item.vin,
        licensePlate: item.licensePlate
      };
      dataObj.push(obj);
    });
    let data = {
      vehicles: dataObj
    };
    this.forwardService.exportExistVehicleApi(data).subscribe(
      response => {},
      response => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
  }

  //添加all
  saveAllExport() {
    this.saveAllVehicles = true;
    if (this._dataSet && this._dataSet.length !== 0) {
      // console.log(this._dataSet);
      let vehicleIds: Array<any> = [];
      this._dataSet.forEach(item => {
        // if (item.check) {
        vehicleIds.push(item.id);
        // }
      });
      let data = {
        taskId: this.data.id,
        platformId: this.data.platform.id,
        vehicleIds: vehicleIds.join(",")
      };
      // let data = {
      //   taskId: this.data.id,
      //   platformId: this.data.platform.id,
      // };
      this.existVehicleCount = 0;
      this.forwardService.getVehicleApi(data).subscribe(
        response => {
          this.saveAllVehicles = false;
          this.handleCancel();
          this.isSelect = true;
          this.insertCount = response.json().data.insertCount;
          if (
            response.json().data.existVehicle &&
            response.json().data.existVehicle.length !== 0
          ) {
            this.existVehicleCount = response.json().data.existVehicle.length;
            this.existVehicle = response.json().data.existVehicle;
          }
        },
        response => {
          this.saveAllVehicles = false;
          let message = DomainFactory.buildError(response.json()).errorMsg;
          this.appNotification.error(message);
        }
      );
    } else {
      this.appNotification.error("请先查询数据");
    }
  }

  // 下载模板
  downDoc() {
    this.forwardService.downloadDoc();
  }

  //上传模板
  // 上传部分的方法
  resetUploadForm() {
    this.uploaderTool.resetForm();
    this.unExistCount = 0;
    this._total = 0;
    this._dataSet = [];
  }

  // getUploadResponse(data) {
  //   // console.log(data.response);
  //   let res = data.response;
  //   this.unExistCount = 0;
  //   if (data.response) {
  //     const res = JSON.parse(data.response);
  //     if (
  //       res.status === 200 &&
  //       res.data &&
  //       Array.isArray(res.data.existsVehicle)
  //     ) {
  //       this._current = 1;
  //       this._dataSet = res.data.existsVehicle;
  //       this._total = res.data.existsVehicle.length;
  //     }
  //     if (
  //       res.status === 200 &&
  //       res.data &&
  //       Array.isArray(res.data.unExistsVehicle)
  //     ) {
  //       this.existVehicle = res.data.unExistsVehicle;
  //       this.unExistCount = this.existVehicle.length;
  //     }
  //   }
  // }

  getUploadResponse(data) {
    if (data && data.response) {
      let res;
      try {
        res = JSON.parse(data.response);
      } catch (err) {
        this.appNotification.error("数据解析错误，请重试！");
      }
      if (res && res.status === 200 && res.data) {
        const { done, callback, importCount } = res.data;
        let lunUrl = "";
        if (done) {
          // console.log(res.data);
        } else {
          if (callback && importCount) {
            let u = callback.replace(/^\/[^\/]*/, "");
            lunUrl = CHANG.API.ForwardVehicle + u;
            if (importCount > 1000) {
              this.importFindText =
                "查询数据量大，查询时间可能较长，请耐心等待";
            } else {
              this.importFindText = "数据查询中，请耐心等待";
            }
            this.isFinding = true;
            this.findingData$ = this.changSer.repeatOutput(lunUrl).subscribe(
              res => {
                if (res && res.status === 200 && res.data && res.data.result) {
                  console.log(0);
                  if (Array.isArray(res.data.result.existsVehicle)) {
                    this._dataSet = res.data.result.existsVehicle;
                    this._total = res.data.result.existsVehicle.length;
                  }
                  if (Array.isArray(res.data.result.unExistsVehicle)) {
                    this.existVehicle = res.data.result.unExistsVehicle;
                    this.unExistCount = this.existVehicle.length;
                  }
                }
                this.isFinding = false;
              },
              err => {
                console.log(err);
                this.isFinding = false;
              }
            );
          }
        }
      }
    }
  }

  uploadFail(data) {
    const defaultMsg = "查询文档上传失败！";
    if (data && data.response) {
      let res = { errorMsg: "" };
      try {
        res = JSON.parse(data.response);
      } catch (e) {
        console.log(e);
      }
      const err = res.errorMsg || defaultMsg;
      this.appNotification.error(err);
    } else {
      this.appNotification.error(defaultMsg);
    }
  }

  cancelBubble(e: any) {
    e.stopPropagation();
  }
}
