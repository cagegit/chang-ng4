import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router, Params } from "@angular/router";
import { NzModalService } from "ng-zorro-antd";
import { ChangService } from "../chang.service";
import { DomainFactory } from "../../common/DomainFactory";
import { AppNotification } from "../../app.notification";
import CHANG from "../CFG_CHANG";
import { UploaderToolComponent } from "../components/uploader-tool.component";
import { flyInOut } from "../../animations";
import { map } from "rxjs/operators";

@Component({
  //   selector: 'app-car-zf',
  templateUrl: "./car-search.component.html",
  styleUrls: ["../car/car-zf.component.scss"],
  animations: [flyInOut]
})
export class CarSearchComponent implements OnInit {
  @ViewChild("uploader")
  // uploaderTool: UploaderToolComponent;
  public DAY_M = 86400000;
  public startDate = new Date(new Date().getTime() - this.DAY_M * 1);
  public endDate = new Date();
  public switchValue = false;
  public validateForm: FormGroup;
  public configTypeEnum: Array<{
    vehicleModel: any;
    functionType: string;
  }> = [];
  public configNameEnum: Array<{
    vehicleModel: any;
    functionType: string;
    functionName: any;
    measureIds: string;
    functionShowName: string;
  }> = [];
  public selectStatus;
  public selectXy;
  public isExport = false;
  currentTabIndex = 0;
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = false;
  params;
  // uploadUrl = CHANG.API.ForwardVehicle + "/importToSearchForwardVehicle";
  daochu$;
  findingData$;
  isFinding = false;
  importFindText = "数据查询中，请耐心等候"; // 导入查询的提示
  importKey: ""; // 导入查询返回的key
  _value: any;
  _name: any;
  vehicles:any;
  vehicleModelEnum:any;
  vin:any;

  startValueChange = () => {
    if (this.startDate > this.endDate) {
      this.endDate = null;
    }
  };
  endValueChange = () => {
    if (this.startDate > this.endDate) {
      this.startDate = null;
    }
  };
  disabledStartDate = startValue => {
    if (!startValue || !this.endDate) {
      return false;
    }
    return startValue.getTime() >= this.endDate.getTime();
  };
  disabledEndDate = endValue => {
    if (!endValue || !this.startDate) {
      return false;
    }
    return endValue.getTime() <= this.startDate.getTime();
  };

  constructor(
    private confirmServ: NzModalService,
    private changSer: ChangService,
    private fb: FormBuilder,
    private appNotification: AppNotification,
    private router: Router
  ) {
    this.validateForm = fb.group({
      vin: [""],
      functionName: [""],
      functionType: [""],
      startForwardTime: [""],
      endForwardTime: [""],
      vehicle:[""]
    });
  }

  ngOnInit() {
    //配置功能种类
    this.changSer.getConfigTypeApi().subscribe(res => {
      if (res && res.data && Array.isArray(res.data)) {
        this.configTypeEnum = res.data;
      }
    });
    this.vehicleModelEnum = ['S301-18','S201'];
    this.vehicles = this.vehicleModelEnum[0];
        
    // this.configTypeEnum = [{"vehicleModel":"S301-18","functionType":"操控配置"},{"vehicleModel":"S301-18","functionType":"节油措施"},{"vehicleModel":"S301-18","functionType":"安全装备"}];
    // this.configNameEnum = [{"measureIds":"1031","vehicleModel":"S301-18","functionType":"操控配置","functionName":"全景天窗"},{"measureIds":"1032","vehicleModel":"S301-18","functionType":"操控配置","functionName":"全景天窗"},{"measureIds":" 1033","vehicleModel":"S301-18","functionType":"操控配置","functionName":"全景天窗"},{"measureIds":"1034","vehicleModel":"S301-18","functionType":"操控配置","functionName":"全景天窗"},{"measureIds":"1031, 1033","vehicleModel":"S301-18","functionType":"操控配置","functionName":"全景天窗"}];
  }

  changeConfigType(data) {
    // console.log(this.validateForm.value);
    this._name = [];
    this.configNameEnum  = [];
    if (data && Array.isArray(data) && data.length !== 0) {
      let params = data.join(",");
      // console.log(params);
      this.changSer.getConfigNameByType(params).subscribe(res => {
        // console.log(res);
        if (res && res.data && Array.isArray(res.data)) {

          this.configNameEnum = res.data.map(v => {
            v.functionShowName = v.functionType + "/" + v.functionName;
            return v;
          });
        }
      });
      // console.log(data);
    }
  }

  public resetForm($event) {
    $event.preventDefault();
    this.params = null;
    // this.validateForm.reset();
    this.DAY_M = 86400000;
    this.startDate = new Date(new Date().getTime() - this.DAY_M * 1);
    this.endDate = new Date();
    this.vehicles = this.vehicleModelEnum[0];
    this._name = [];
    this._value = [];
    this.configNameEnum  = [];
    this.vin = '';
    this.refreshData(true);
  }

  //条件查询
  search($event, value) {
    $event.preventDefault();
    this.params = value;
    this.refreshData(true);
  }
  // 刷新数据
  refreshData(reset = false) {
    // console.log(this.params);
    this._loading = true;
    let data;
    //需要过滤掉种类变化时 还在functionName里的无效数据；
    if(this.params){
      this.params.funtionName = "";
      this.params.funtionName = this._name.map(v => {
        return v;
      });
      data = {
        vin: this.params.vin,
        period:{
          from:new Date(this.params.startForwardTime).getTime(),
          to:new Date(this.params.endForwardTime).getTime()
        },
        measureIds: this.params.funtionName.join(","),
        vehicleModel:this.params.vehicle
      };
    }else{
      data = {
        vin: '',
        period:{
          from:new Date(this.startDate).getTime(),
          to:new Date(this.endDate).getTime()
        },
        measureIds: '',
        vehicleModel:this.vehicles
      };
    }
    const vParams = Object.assign({}, data);
    this._loading = true;
    this.changSer
      .getActivityCarListApi(vParams)
      .subscribe(
        (res: any) => {
          // console.log(res);
          if (res && res.data) {
            // this._total = res.data.total;
            this._dataSet = res.data;
          }
          this._loading = false;
        },
        (res: Response) => {
          let message = DomainFactory.buildError(res).errorMsg;
          this.appNotification.error(message);
          this._loading = false;
        }
      );
  }

  // 导出查询文档
  exportFile() {
    if (this._dataSet.length === 0) {
      this.appNotification.error("没有可导出的数据！");
      return;
    }
    //需要过滤掉种类变化时 还在functionName里的无效数据；
    let data;
    if(this.params){
      this.params.funtionName = "";
      this.params.funtionName = this._name.map(v => {
        return v;
      });
      data = {
        vin: this.params.vin,
        period:{
          from:new Date(this.params.startForwardTime).getTime(),
          to:new Date(this.params.endForwardTime).getTime()
        },
        measureIds: this.params.funtionName.join(","),
        vehicleModel:this.params.vehicle
      };
    }else{
      data = {
        vin: '',
        period:{
          from:new Date(this.startDate).getTime(),
          to:new Date(this.endDate).getTime()
        },
        measureIds: '',
        vehicleModel:this.vehicles
      };
    }
    const vParams = Object.assign({}, data);
    this.isExport = true;
    this.changSer.exportMeasure(vParams).subscribe(
      res => {
        this.appNotification.success("导出成功！");
        this.isExport = false;
      },
      () => {
        this.appNotification.error("导出失败！");
        this.isExport = false;
      }
    );
  }
}
