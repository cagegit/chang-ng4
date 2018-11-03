import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import {ChangService} from "../chang.service";
import {DomainFactory} from "../../common/DomainFactory";
import {AppNotification} from "../../app.notification";
import {CHANG} from "../CFG_CHANG";
import {UploaderToolComponent} from "../components/uploader-tool.component";
import {flyInOut} from "../../animations";


@Component({
  selector: 'app-car-zf',
  templateUrl: './car-zf.component.html',
  styleUrls: ['./car-zf.component.scss'],
  animations: [
    flyInOut
  ]
})
export class CarZfComponent implements OnInit,OnDestroy {
  @ViewChild('uploader') uploaderTool: UploaderToolComponent;
  public tabs = [
    {
      name   : '条件查询'
    },
    {
      name   : '导入查询'
    }
  ];
  public currentTabIndex = 0;
  public switchValue = false;

  public validateForm: FormGroup;
  public statusOptions = [
    { value: '', label: '全部' },
    { value: '在线', label: '在线' },
    { value: '离线', label: '离线' }
  ];
  public xyOptions:Array<{id:any,name:string}> = [];
  public platforms:Array<{unitName:string,id:any}> = [];
  public selectStatus;
  public selectXy;
  public vendorEnum: Array<any> = [];
  public isExport= false;

  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = false;
  _dataSet2 =[];
  _pageSize2 = 10;
  _unExistsCar= [];
  _hasFindNum = 0;
  _notFindNum = 0;

  params;
  uploadUrl = CHANG.API.ForwardVehicle+'/importToSearchForwardVehicle';

  daochu$;
  findingData$;
  isFinding = false;
  importFindText = '数据查询中，请耐心等候'; // 导入查询的提示
  importKey:''; // 导入查询返回的key
  constructor(private confirmServ: NzModalService, private changSer: ChangService,private fb: FormBuilder,private appNotification: AppNotification,
              private router: Router) {
    this.validateForm = fb.group({
      licensePlate: [''],
      vin: [''],
      vendor: [''],
      platformId: [''],
      status: [''],
      protocolId: ['']
    });
  }
 

  ngOnInit() {
    this.changSer.getPlatformList().subscribe(res => {
      // console.log(res);
      if(res && res.data && Array.isArray(res.data)) {
          this.platforms = res.data.map((item) => {
               return {unitName:item.unitName,id:item.id};
          });
      }
    });
    this.changSer.getProtocolList().subscribe(res => {
        // console.log(res);
      if(res && res.data && Array.isArray(res.data)) {
         this.xyOptions = res.data.map(v => {
           return {name:v.name,id:v.id};
         });
      }
    });
    //车辆厂商
    this.changSer.getSysDict("002").subscribe(
      (response) => {
        let data = response.data;
        this.vendorEnum = [];
        data.forEach(item => {
          this.vendorEnum.push(item);
        });
      },
      (response) => {
        let message = DomainFactory.buildError(response.json()).errorMsg;
        this.appNotification.error(message);
      }
    );
    this.refreshData(true);
  }
  ngOnDestroy() {
    if(this.daochu$) {
      this.daochu$.unsubscribe();
    }
    if(this.findingData$) {
      this.findingData$.unsubscribe();
    }
  }

  public resetForm($event) {
    $event.preventDefault();
    this.params = null;
    this.validateForm.reset();
    this.refreshData(true);
  }

  // 删除
  public deleteRecord(data) {
    const that = this;
    this.confirmServ.confirm({
      title  : '删除转发车辆配置',
      content: '转发配置删除后，该车辆将停止向目标平台转发数据，是否继续删除？',
      onOk() {
         console.log('ok');
        that.deleteCar(data);
      },
      onCancel() {
        console.log('cancel');
      }
    });
  };
  deleteCar(data) {
       const params = {taskId: data.taskId,platformId: data.platformId,vehicleIds:data.vehicleId};
       // console.log(data);
      this.changSer.removeCar(params).subscribe(res => {
           // console.log(res);
           if(res.status===200) {
             this.appNotification.success('刪除成功！');
             if(this.currentTabIndex===0) {
               this.refreshData(true);
             } else {
               this._dataSet2 = this._dataSet2.filter(item => item._id !== data._id);
               this._pageSize2 = 10;
             }
           } else {
             this.appNotification.error('删除失败！');
           }
      },() => {
        // let message = DomainFactory.buildError(err).errorMsg;
        this.appNotification.error('删除失败！');
      });
  };
  // 查询日志
  checkLogs(vin) {
    console.log(vin);
    this.router.navigate(['/chang/car/log'], {
      queryParams: {
        vin: vin
      }
    })
  }
  //条件查询
  search($event,value) {
    $event.preventDefault();
    // console.log(value);
    this.params = value;
    this.refreshData(true);
  }
  // 刷新数据
  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    this._loading = true;
    const vParams = Object.assign({},this.params);
    // console.log(vParams);
    delete vParams.status;
    this._loading = true;
    this.changSer.getZfCarList(vParams,this._current,this._pageSize).subscribe((res: any) => {
      // console.log(res);
      if(res && res.data) {
        this._total = res.data.total;
        this._dataSet = res.data.list;
      }
      this._loading = false;
    },(res:Response) => {
      let message = DomainFactory.buildError(res).errorMsg;
      this.appNotification.error(message);
      this._loading = false;
    });
  };
  //
  resetUploadForm() {
    this.uploaderTool.resetForm();
    this._notFindNum = 0;
    this._dataSet2 = [];
    this._unExistsCar = [];
  }
  getUploadResponse(data) {
    if(data && data.response) {
      let res;
      try {
          res = JSON.parse(data.response);
      } catch (err) {
        this.appNotification.error('数据解析错误，请重试！');
      }
      if(res && res.status ===200 && res.data) {
        const {done,callback,importCount} = res.data;
        let lunUrl = '';
        if(done) {
           console.log(res.data);
        } else {
          if(callback && importCount) {
            let u  = callback.replace(/^\/[^\/]*/,'');
            this.importKey = u.replace(/\/asnyStatus\//,'');
            lunUrl = CHANG.API.ForwardVehicle+ u;
            if(importCount>1000) {
              this.importFindText = '查询数据量大，查询时间可能较长，请耐心等待';
            } else {
              this.importFindText = '数据查询中，请耐心等待';
            }
            this.isFinding = true;
            this.findingData$ = this.changSer.repeatOutput(lunUrl).subscribe(res => {
                if(res && res.status ===200 && res.data && res.data.result) {
                  if(Array.isArray(res.data.result.forwardVehicle)) {
                    this._dataSet2 = res.data.result.forwardVehicle;
                    this._dataSet2.forEach((item,i) => {
                      item._id = i;
                    });
                  }
                  this._hasFindNum = this._dataSet2.length;
                  if(Array.isArray(res.data.result.unExistsVehicle)) {
                    this._unExistsCar = res.data.result.unExistsVehicle;
                  }
                  this._notFindNum = this._unExistsCar.length;
                }
                this.isFinding = false;
            },err => {
                console.log(err);
                this.isFinding = false;
            });
          }
        }
      }
    }

  }
  uploadFail(data) {
    const defaultMsg = '查询文档上传失败！';
    if(data && data.response) {
       let res = {errorMsg:''};
        try{
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
  // 下载模板
  downDoc() {
    this.changSer.downloadDoc();
  }
  // 导出查询文档
  exportFile() {
     if(this.currentTabIndex===1) {
       if(this._dataSet2.length===0) {
         this.appNotification.error('没有可导出的数据！');
         return;
       }
       const da = JSON.parse(JSON.stringify(this._dataSet2));
       da.forEach(item => {
           delete item._id;
       });
       // const data = {forwardVehicleResultVos: da};
       this.isExport = true;
       this.changSer.exportSelectDoc(1,{key:this.importKey}).subscribe(res => {
         // console.log(res);
         this.appNotification.success('导出成功！');
         this.isExport = false;
       },() => {
         this.appNotification.error('导出失败！');
         this.isExport = false;
       });
     } else {
       const vParams = Object.assign({},this.params);
       delete vParams.status;
       this.isExport =true;
       this.daochu$ = this.changSer.exportSelectDoc(0,vParams).subscribe(res => {
         this.appNotification.success('导出成功！');
         this.isExport =false;
       }, () => {
         this.appNotification.error('导出失败！');
         this.isExport =false;
       });
     }
  }
  // 导出未处理表格
  exportUnHandleData() {
    if(this._unExistsCar.length===0) {
      return;
    }
    const data = {vehicles: this._unExistsCar.map(item => {
        return {licensePlate:item.licensePlate, vin:item.vin};
      })};
    this.changSer.exportSelectDoc(2,data,'未查到车辆列表_').subscribe(() => {
      this.appNotification.success('导出成功！');
    },() => {
      this.appNotification.error('导出失败！');
    });
  }
}
