import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import CHANG from "../CFG_CHANG";
import {UploaderToolComponent} from "../components/uploader-tool.component";
import {ChangService} from "../chang.service";
import {flyInOut} from "../../animations";
import {DomainFactory} from "../../common/DomainFactory";
import {AppNotification} from "../../app.notification";

@Component({
  selector: 'app-car-log',
  templateUrl: './car-log.component.html',
  styleUrls: ['./car-log.component.scss'],
  animations: [
    flyInOut
  ]
})
export class CarLogComponent implements OnInit,OnDestroy {
  @ViewChild('uploader') uploaderTool: UploaderToolComponent;
  public tabs = [
    {
      name   : '条件查询',
      content: 'Content of Tab Pane 1'
    },
    {
      name   : '导入查询',
      content: 'Content of Tab Pane 2'
    }
  ];
  public currentTabIndex =0;
  public switchValue = false;

  public validateForm: FormGroup;
  public typeOptions = [
    { value: '', label: '全部' },
    { value: '1', label: '转入' },
    { value: '2', label: '转出' }
  ];
  public fsOptions = [
    { value: '', label: '全部' },
    { value: '1', label: 'WS' },
    { value: '2', label: 'SOCKET' }
  ];
  public resOptions = [
    { value: '', label: '全部' },
    { value: '1', label: '成功' },
    { value: '2', label: '失败' }
  ];
  public selectType;
  public selectFs;
  public selectRes;
  public DAY_M = 86400000;
  public startDate = new Date((new Date().getTime()-this.DAY_M*30));
  public endDate = new Date();
  public isExport:boolean = false;
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = false;
  _dataSet2 = [];
  _unExistsVehicle = [];
  _pageSize2 =10;
  _hasFindNum = 0;
  _notFindNum = 0;

  params;
  exportText = '导出';
  // 转发平台
  public platforms:Array<{unitName:string,id:any}> = [];
  // 上传部分
  // uploadUrl = CHANG.API.ForwardLog+'/importToSearchForwardLog';
  uploadUrl = CHANG.API.ForwardNewLog+'/info/upload';

  daochu$;
  // 转发日志
  endDate2 = new Date();
  startDate2 = new Date(this.endDate2.getTime()-(30*24*60*60*1000));
  uploadParams;
  constructor(private fb:FormBuilder,private changSer: ChangService,private appNotification: AppNotification
  ,private activatedRoute: ActivatedRoute) {
    this.validateForm = fb.group({
      // licensePlate: [''],
      vin: [''],
      forwardPlatform: [''],
      forwardType: [''],
      forwardMode: [''],
      forwardResult: [''],
      startForwardTime: [''],
      endForwardTime: ['']
    });
    activatedRoute.queryParams.subscribe(queryParams => {
        if(queryParams.vin) {
          this.validateForm.patchValue({vin:queryParams.vin});
          this.params = {vin: queryParams.vin,startForwardTime:this.startDate.getTime(),endForwardTime:this.endDate.getTime()};
          this.refreshData(true);
        }
    });
  }

  ngOnInit() {
    this.selectType = this.typeOptions[0];
    this.selectFs = this.fsOptions[0];
    this.selectRes = this.resOptions[0];
    this.changSer.getPlatformList().subscribe(res => {
      if(res && res.data && Array.isArray(res.data)) {
        this.platforms = res.data.map((item) => {
          return {unitName:item.unitName,id:item.id};
        });
      }
    });
  }

  ngOnDestroy() {
    if(this.daochu$) {
      this.daochu$.unsubscribe();
    }
  }

  formatDate(date,fmt='yyyy-MM-dd hh:mm:ss') {
    const o = {
      "M+" : date.getMonth()+1,                 //月份
      "d+" : date.getDate(),                    //日
      "h+" : date.getHours(),                   //小时
      "m+" : date.getMinutes(),                 //分
      "s+" : date.getSeconds(),                 //秒
      "q+" : Math.floor((date.getMonth()+3)/3), //季度
      "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
      fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
      if(new RegExp("("+ k +")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
  }
  onSubmit($event,data) {
    $event.preventDefault();
    if(!data.vin) {
      this.appNotification.error('请输入vin!');
      return;
    }
    this.params = data;
    this.refreshData(true);
  }
  resetForm($event) {
    $event.preventDefault();
    this.validateForm.reset();
    // this.refreshData(true);
  }
  // 上传部分的方法
  resetUploadForm() {
    this.uploaderTool.resetForm();
    this._notFindNum = 0;
    this._dataSet2 = [];
    this._unExistsVehicle = [];
  }
  getUploadResponse(data) {
    if(data.response) {
      let res;
      try {
        res = JSON.parse(data.response);
        // console.log(res);
      } catch (err) {
        console.log(err);
        this.appNotification.error('数据解析错误，请重试！');
      }
      if(res && res.status ===200 && res.data) {
        if(Array.isArray(res.data.logSearchVos)) {
          this._dataSet2 = res.data.logSearchVos;
          this._dataSet2.forEach(v => {
            v.forwardTime = this.formatDate(new Date(v.forwardTime));
          });
        }
        this._hasFindNum = res.data.existsVehicleCount || 0;
        if(Array.isArray(res.data.unExistsVehicle)) {
          this._notFindNum = res.data.unExistsVehicle.length;
          this._unExistsVehicle = res.data.unExistsVehicle;
        } else {
          this._notFindNum = 0;
        }
      }
    }
  }
  uploadFail(res) {
    let errMsg =  '上传查询模板失败！';
    try {
      errMsg = (res && res.response && JSON.parse(res.response).errorMsg);
    } catch (e) {
      console.log(e);
    }
    this.appNotification.error(errMsg);
  }
  downDoc() {
    this.changSer.downloadNewDoc();
  }
  // 刷新日志
  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    const vParams = Object.assign({},this.params);
    if(vParams.startForwardTime && vParams.endForwardTime) {
       if(vParams.startForwardTime >= vParams.endForwardTime) {
         this.appNotification.error('结束时间不能大于开始时间!');
         return;
       }
       const cha = (vParams.endForwardTime- vParams.startForwardTime)/this.DAY_M;
       if(cha>30) {
         this.appNotification.error('查询时间范围不能超过30天!');
         return;
       }
    }
    this._loading = true;
    this.changSer.getNewForwardLog(vParams,this._current,this._pageSize).subscribe((res: any) => {
      // console.log(res);
      if(res && res.data) {
        // this._total = res.data.total;
        // this._dataSet = res.data.list;
        this._total = (res.data.page && res.data.page.totalPage) || res.data.data.length;
        this._dataSet = res.data.data;
        this._dataSet.forEach(v => {
          v.forwardTime = this.formatDate(new Date(+v.forwardTime));
          v.licensePlate = v.license_plate;
          v.forwardPlatform = v.static_forward_platform;
          if(v.flag=='0') {
            v.forwardType = '';
          } else {
            v.forwardType = v.flag=='1'?'转入':'转出';// 转入 1 转出 2
          }
          if(v.type=='0') {
            v.forwardMode = '';
          } else {
            v.forwardMode = v.type=='1'?'WS':'SOCKET';// 转发方式 1 webservice 2 websocket
          }
          if(v.result=='0') {
            v.forwardResult = '';
          } else {
            v.forwardResult = v.result=='1'?'成功':'失败';// 1 成功 2 失败
          }

        });
      }
      this._loading = false;
    },(res:Response) => {
      let message = DomainFactory.buildError(res).errorMsg;
      this.appNotification.error(message);
      this._loading = false;
    });
  }
  createParams() {
    return Object.assign({},{type:'time',startTime:this.startDate2,endTime:this.endDate2})
  }
  // 导出日志数据
  exportLog(params?:any){
    if(this.currentTabIndex===1) {
      if(this._dataSet2.length===0) {
        this.appNotification.error('没有可导出的数据！');
        return;
      }
      const data = {logs: this._dataSet2};
      this.isExport = true;
      this.changSer.exportLogDoc(1,data).subscribe(res => {
        // console.log(res);
        this.appNotification.success('导出成功！');
        this.isExport = false;
      },err => {
        // console.log(err);
        this.appNotification.error('导出失败！');
        this.isExport = false;
      });
    } else {
      const vParams = Object.assign({},params);
      if(!vParams.vin) {
        this.appNotification.error('请输入vin!');
        return;
      }
      this.isExport = true;
      this.daochu$ = this.changSer.exportNewLogDoc(vParams).subscribe(res => {
        this.appNotification.success('导出成功！');
        this.isExport = false;
      }, () => {
        this.appNotification.error('导出失败！');
        this.isExport = false;
      });
    }
  }
  // 导出未处理表格
  exportUnHandleData() {
    if(this._unExistsVehicle.length===0) {
      return;
    }
    const data = {vehicles: this._unExistsVehicle.map(item => {
          return {licensePlate:item.licensePlate, vin:item.vin};
      })};
    this.changSer.exportSelectDoc(2,data,'未查到日志列表_').subscribe(() => {
      this.appNotification.success('导出成功！');
    },() => {
      this.appNotification.error('导出失败！');
    });
  }
}
