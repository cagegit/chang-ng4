import { Component, OnInit,Input,OnChanges,SimpleChanges} from '@angular/core';
import { graphic } from 'echarts';
import { ChangService } from '../chang.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dash-view',
  templateUrl: './dash-view.component.html',
  styleUrls: ['./dash-view.component.scss']
})
export class DashViewComponent implements OnInit,OnChanges {
  @Input() dashboard:{content:Array<any>};
  @Input() isPreview:boolean;
  curPage:any = {id:0};
  isTemplate = true;
  count = 0;
  // echarts
  options: any;
  isLoading = false;
  axisList = []; // 横坐标轴
  yxixList = []; // 垂直坐标轴
  // 获取表格数据的参数
  tableId;
  isWorkDay = false;

  // 选择日期
  _startDate = null;
  _endDate = null;
  constructor(private chageSer:ChangService) { }

  ngOnInit() {
    // this.curPage = this.dashboard.content[0];
    console.log(this.dashboard);
    // const dataAxis = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
    // const data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220];

    this.initChart([],[]);
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.dir(changes['dashboard']);
    console.log('dash-view changes:'+(++this.count));
    this.dashboard.content = changes['dashboard'].currentValue.content;
    if(this.dashboard.content.length>0) {
      this.setCurPage(this.dashboard.content[0]);
    }
  }
  // 切换菜单
  changeCurPage(page,$event) {
    this.setCurPage(page);
    $event.preventDefault();
  }
  setCurPage(page) {
    this.curPage = page;
    this.tableId = page.id;
    this.getTableData(page.id);
  }
  // 获取表数据
  getTableData(tableId,startDate='2018-9-1',endDate='2018-9-29',isWorkDay=0) {
     if(tableId ===undefined) {
       return;
     }
     this.isLoading = true;
     this.chageSer.getDataByTableId(tableId,startDate,endDate,isWorkDay).subscribe(res => {
         // console.log(res);
         if(res && res.data) {
           const {attribute,tabledata} = res.data;
           let xAix = [];
           if(attribute && attribute.head_name) {
             xAix = attribute.head_name.split(';');
           }
           this.axisList = xAix;
           this.initChart(xAix,[150,600]);
         }
         this.isLoading = false
     },err => {
         console.log(err);
         this.isLoading = false;
     });
  }
  print() {
    if(this._startDate && this._endDate) {
      const s =this.chageSer.formatDate(this._startDate);
      const e = this.chageSer.formatDate(this._endDate);
      console.log(`startDate:${s},endDate:${e}`);
      const isWorkDay = this.isWorkDay? 1: 0;
      this.getTableData(this.tableId,s,e,isWorkDay);
    }
  }
  initChart(dataAxis,data) {
    const yMax = 500;
    const dataShadow = [];

    for (let i = 0; i < data.length; i++) {
      dataShadow.push(yMax);
    }

    this.options = {
      xAxis: {
        data: dataAxis,
        axisLabel: {
          inside: false,
          textStyle: {
            color: '#red'
          }
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#999'
          }
        }
      },
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        { // For shadow
          type: 'bar',
          itemStyle: {
            normal: { color: 'rgba(0,0,0,0.05)' }
          },
          barGap: '-100%',
          barCategoryGap: '40%',
          data: dataShadow,
          animation: false
        },
        {
          type: 'bar',
          itemStyle: {
            normal: {
              color: new graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ]
              )
            },
            emphasis: {
              color: new graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ]
              )
            }
          },
          data: data
        }
      ]
    };
  }

  newArray = (len) => {
    const result = [];
    for (let i = 0; i < len; i++) {
      result.push(i);
    }
    return result;
  };
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
  };
  _endValueChange = () => {
    if (this._startDate > this._endDate) {
      this._startDate = null;
    }
  };
  _disabledStartDate = (startValue) => {
    if (!startValue || !this._endDate) {
      return false;
    }
    return startValue.getTime() >= this._endDate.getTime();
  };
  _disabledEndDate = (endValue) => {
    if (!endValue || !this._startDate) {
      return false;
    }
    return endValue.getTime() <= this._startDate.getTime();
  };
  get _isSameDay() {
    return this._startDate && this._endDate && moment(this._startDate).isSame(this._endDate, 'day')
  }
  get _endTime() {
    return {
      nzHideDisabledOptions: true,
      nzDisabledHours: () => {
        return this._isSameDay ? this.newArray(this._startDate.getHours()) : [];
      },
      nzDisabledMinutes: (h) => {
        if (this._isSameDay && h === this._startDate.getHours()) {
          return this.newArray(this._startDate.getMinutes());
        }
        return [];
      },
      nzDisabledSeconds: (h, m) => {
        if (this._isSameDay && h === this._startDate.getHours() && m === this._startDate.getMinutes()) {
          return this.newArray(this._startDate.getSeconds());
        }
        return [];
      }
    }
  }
}
