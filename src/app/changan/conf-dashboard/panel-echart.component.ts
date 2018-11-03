import { Component, OnInit,Input,OnChanges,SimpleChanges,ViewChild,ElementRef} from '@angular/core';
import { graphic } from 'echarts';
import { ChangService } from '../chang.service';
import * as moment from 'moment';
import * as echarts from 'echarts';
import { CHART_TYPE_LIST } from '../CFG_CHANG';
import { AppNotification } from '../../app.notification';
import { HttpErrorResponse } from '@angular/common/http';
import { NzModalService } from 'ng-zorro-antd';
import { DataHandleService } from '../data.handle.service';
export interface ChartConfig {
  chart_axis_index: "0" // 坐标横轴下标
  chart_name_index: "1" // 坐标横轴的名称
  chart_type: "1" // 图表类型
  chart_value_index: "2,3" // 指标的下标，度量（指标）
  cols_width: null // 宽度
  head_name: "日期;num1;num2;num3" // 坐标头名称
  head_rowspan: "1"
  id: "1006"  // 表id
  name: "新增表格" // dashboard 名称
  page_size: null
  status: "1" // 是否启用
  ext_attribute: string // "{"chat_name_show":1,"attrFilter":"0:1;1:1;2:1"}"
}
// 筛选分类的值
interface CateInfo {
  index:number;
  name: string;
  list?: Array<any>;
  multiples?: Array<any>; // 过滤数据
  value?:string;
  c?:string; // 逻辑运算符 > >= = < <=
}
// 维度、指标处理的返回值
interface WzInfo {
  zbList: Array<any>;
  axisList: Array<any>;
  seriesList: Array<any>;
}

@Component({
  selector: 'app-panel-echart',
  templateUrl: './panel-echart.component.html',
  styleUrls: ['./panel-echart.component.scss']
})
export class PanelEchartComponent implements OnInit,OnChanges {
  @Input() tableId:string;
  @Input() panelID:string;
  @Input() chartTxt:string ='请拖入图表';
  @Input() forceChange:boolean = false; // 强制更新  截取字符串后
  @Input() timeRange:string = '14:1';
  @ViewChild('pchart') pchart: ElementRef;
  count = 0;
  // echarts
  options: any;
  isLoading = false;
  axisList = []; // 横坐标轴
  yxixList = []; // 垂直坐标轴
  // 获取表格数据的参数
  // tableId;
  isWorkDay = false;

  // 选择日期
  _startDate = null;
  _endDate = null;

  // 图表类型列表
  chartTypes = CHART_TYPE_LIST;
  chartId;
  // 多选款参数
  size = 'default';
  wdOptions = [];
  multiple = [];
  // 过滤条件参数
  canCate:CateInfo[] = [];// 可以下拉的过滤条件
  noCate:CateInfo[]  = [];// 值类型的过滤条件
  isConfirmLoading = false;
  currentModal;
  currentWd = [];
  currentType = 'bar';
  ysfList = ['>','>=','=','<','<='];
  currentData = [];
  currentAttr;
  isGlShow = false;
  // 默认开始、结束时间
  defaultStartTime;
  defaultEndTime;
  convertData = function (geoCoordMap,data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        });
      }
    }
    return res;
  };
  constructor(private chageSer:ChangService,private appNotification:AppNotification,private modalService: NzModalService,private dataHandleSer:DataHandleService) { }

  ngOnInit() {
    // console.log(this.pchart);
    this.makeDefaultTimeRange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['timeRange'] && changes['timeRange'].currentValue) {
      this.timeRange = changes['timeRange'].currentValue;
      this.makeDefaultTimeRange();
    }
    if(this.forceChange) {
      if(changes['tableId'].currentValue) {
        let tableId = changes['tableId'].currentValue.split('-')[1];
        this.getTableData(tableId);
      } else {
        this.options = undefined;
        this.isLoading = false;
        this.axisList = [];
      }
    } else {
      if(changes['tableId'].currentValue) {
        this.getTableData(changes['tableId'].currentValue);
      } else {
        this.options = undefined;
        this.isLoading = false;
        this.axisList = [];
      }
    }
  }
  // 根据timeRange参数修改时间范围
  makeDefaultTimeRange() {
    if(this.timeRange) {
      let arr:any = this.timeRange.split(':');
      if(arr.length ===2) {
         arr = arr.map(v => parseInt(v,10));
         if(arr[1]>=arr[0]) {
           arr[0] =14;
         }
         const res =this.getTimeRange(arr[0],arr[1]);
         this.defaultStartTime = res.start;
         this.defaultEndTime = res.end;
        if(res.start!==0) {
          this._startDate = new Date(res.start);
        }
        if(res.end !==0) {
          this._endDate = new Date(res.end);
        }
      }
    }
  }
  // 根式化 echart数据视图
  getDataView(opt) {
    let axisData = [];
    if(opt.xAxis && opt.xAxis.length>0) {
      axisData = opt.xAxis[0].data;
    }
    let series = opt.series;
    let tdHeaders = '<td>名称</td>'; //表头
    series.forEach(function(item) {
      tdHeaders += '<td>' + item.name + '</td>'; //组装表头
    });
    let table = '<div class="table-responsive" style="padding: 10px;"><table class="table table-bordered table-striped table-hover" style="text-align:center"><tbody><tr>' + tdHeaders + '</tr>';
    let tdBodys = ''; //数据
    for (let i = 0, l = axisData.length; i < l; i++) {
      for (let j = 0; j < series.length; j++) {
        tdBodys += '<td>' + series[j].data[i] + '</td>'; //组装表数据
      }
      table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBodys + '</tr>';
      tdBodys = '';
    }
    table += '</tbody></table></div>';
    return table;
  }
  // 获取时间范围
  getTimeRange(start:number,end:number) {
    const nowDate = new Date();
    const oneDayTimes = 24*60*60*1000;
    let res = {start:0,end:0};
    res.start = nowDate.setTime(new Date().getTime()-(start*oneDayTimes));
    res.end = nowDate.setTime(new Date().getTime()-(end*oneDayTimes));
    return res;
  }
  // 中国地图的配置菜单
  chinaMapOption(chinaJson,geoCoordMap,data,zbName) {
    echarts.registerMap('china', chinaJson);
    const that = this;
    this.options = {
      backgroundColor: '#404a59',
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return params.name + ' : ' + params.value[2];
        }
      },
      legend: {
        orient: 'vertical',
        y: 'bottom',
        x:'right',
        data:[zbName],
        textStyle: {
          color: '#fff'
        }
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {
            readOnly: false,
            optionToContent : function(opt) {
              return that.getDataView(opt);
            }
          },
          saveAsImage: {}
        }
      },
      visualMap: {
        min: 0,
        max: 200,
        calculable: true,
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        },
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: 'china',
        label: {
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            areaColor: '#323c48',
            borderColor: '#111'
          },
          emphasis: {
            areaColor: '#2a333d'
          }
        }
      },
      series: [
        {
          name: zbName,
          type: 'scatter',
          coordinateSystem: 'geo',
          data: this.convertData(geoCoordMap,data),
          symbolSize: 12,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            emphasis: {
              borderColor: '#fff',
              borderWidth: 1
            }
          }
        }
      ]
    }
  }
  // 生成中国地图
  chinaMap(data,wd,zb,gl) {
    const geoCoordMap = {
      "海门":[121.15,31.89],
      "鄂尔多斯":[109.781327,39.608266],
      "招远":[120.38,37.35],
      "舟山":[122.207216,29.985295],
      "齐齐哈尔":[123.97,47.33],
      "盐城":[120.13,33.38],
      "赤峰":[118.87,42.28],
      "青岛":[120.33,36.07],
      "乳山":[121.52,36.89],
      "金昌":[102.188043,38.520089],
      "泉州":[118.58,24.93],
      "莱西":[120.53,36.86],
      "日照":[119.46,35.42],
      "胶南":[119.97,35.88],
      "南通":[121.05,32.08],
      "拉萨":[91.11,29.97],
      "云浮":[112.02,22.93],
      "梅州":[116.1,24.55],
      "文登":[122.05,37.2],
      "上海":[121.48,31.22],
      "攀枝花":[101.718637,26.582347],
      "威海":[122.1,37.5],
      "承德":[117.93,40.97],
      "厦门":[118.1,24.46],
      "汕尾":[115.375279,22.786211],
      "潮州":[116.63,23.68],
      "丹东":[124.37,40.13],
      "太仓":[121.1,31.45],
      "曲靖":[103.79,25.51],
      "烟台":[121.39,37.52],
      "福州":[119.3,26.08],
      "瓦房店":[121.979603,39.627114],
      "即墨":[120.45,36.38],
      "抚顺":[123.97,41.97],
      "玉溪":[102.52,24.35],
      "张家口":[114.87,40.82],
      "阳泉":[113.57,37.85],
      "莱州":[119.942327,37.177017],
      "湖州":[120.1,30.86],
      "汕头":[116.69,23.39],
      "昆山":[120.95,31.39],
      "宁波":[121.56,29.86],
      "湛江":[110.359377,21.270708],
      "揭阳":[116.35,23.55],
      "荣成":[122.41,37.16],
      "连云港":[119.16,34.59],
      "葫芦岛":[120.836932,40.711052],
      "常熟":[120.74,31.64],
      "东莞":[113.75,23.04],
      "河源":[114.68,23.73],
      "淮安":[119.15,33.5],
      "泰州":[119.9,32.49],
      "南宁":[108.33,22.84],
      "营口":[122.18,40.65],
      "惠州":[114.4,23.09],
      "江阴":[120.26,31.91],
      "蓬莱":[120.75,37.8],
      "韶关":[113.62,24.84],
      "嘉峪关":[98.289152,39.77313],
      "广州":[113.23,23.16],
      "延安":[109.47,36.6],
      "太原":[112.53,37.87],
      "清远":[113.01,23.7],
      "中山":[113.38,22.52],
      "昆明":[102.73,25.04],
      "寿光":[118.73,36.86],
      "盘锦":[122.070714,41.119997],
      "长治":[113.08,36.18],
      "深圳":[114.07,22.62],
      "珠海":[113.52,22.3],
      "宿迁":[118.3,33.96],
      "咸阳":[108.72,34.36],
      "铜川":[109.11,35.09],
      "平度":[119.97,36.77],
      "佛山":[113.11,23.05],
      "海口":[110.35,20.02],
      "江门":[113.06,22.61],
      "章丘":[117.53,36.72],
      "肇庆":[112.44,23.05],
      "大连":[121.62,38.92],
      "临汾":[111.5,36.08],
      "吴江":[120.63,31.16],
      "石嘴山":[106.39,39.04],
      "沈阳":[123.38,41.8],
      "苏州":[120.62,31.32],
      "茂名":[110.88,21.68],
      "嘉兴":[120.76,30.77],
      "长春":[125.35,43.88],
      "胶州":[120.03336,36.264622],
      "银川":[106.27,38.47],
      "张家港":[120.555821,31.875428],
      "三门峡":[111.19,34.76],
      "锦州":[121.15,41.13],
      "南昌":[115.89,28.68],
      "柳州":[109.4,24.33],
      "三亚":[109.511909,18.252847],
      "自贡":[104.778442,29.33903],
      "吉林":[126.57,43.87],
      "阳江":[111.95,21.85],
      "泸州":[105.39,28.91],
      "西宁":[101.74,36.56],
      "宜宾":[104.56,29.77],
      "呼和浩特":[111.65,40.82],
      "成都":[104.06,30.67],
      "大同":[113.3,40.12],
      "镇江":[119.44,32.2],
      "桂林":[110.28,25.29],
      "张家界":[110.479191,29.117096],
      "宜兴":[119.82,31.36],
      "北海":[109.12,21.49],
      "西安":[108.95,34.27],
      "金坛":[119.56,31.74],
      "东营":[118.49,37.46],
      "牡丹江":[129.58,44.6],
      "遵义":[106.9,27.7],
      "绍兴":[120.58,30.01],
      "扬州":[119.42,32.39],
      "常州":[119.95,31.79],
      "潍坊":[119.1,36.62],
      "重庆":[106.54,29.59],
      "台州":[121.420757,28.656386],
      "南京":[118.78,32.04],
      "滨州":[118.03,37.36],
      "贵阳":[106.71,26.57],
      "无锡":[120.29,31.59],
      "本溪":[123.73,41.3],
      "克拉玛依":[84.77,45.59],
      "渭南":[109.5,34.52],
      "马鞍山":[118.48,31.56],
      "宝鸡":[107.15,34.38],
      "焦作":[113.21,35.24],
      "句容":[119.16,31.95],
      "北京":[116.46,39.92],
      "徐州":[117.2,34.26],
      "衡水":[115.72,37.72],
      "包头":[110,40.58],
      "绵阳":[104.73,31.48],
      "乌鲁木齐":[87.68,43.77],
      "枣庄":[117.57,34.86],
      "杭州":[120.19,30.26],
      "淄博":[118.05,36.78],
      "鞍山":[122.85,41.12],
      "溧阳":[119.48,31.43],
      "库尔勒":[86.06,41.68],
      "安阳":[114.35,36.1],
      "开封":[114.35,34.79],
      "济南":[117,36.65],
      "德阳":[104.37,31.13],
      "温州":[120.65,28.01],
      "九江":[115.97,29.71],
      "邯郸":[114.47,36.6],
      "临安":[119.72,30.23],
      "兰州":[103.73,36.03],
      "沧州":[116.83,38.33],
      "临沂":[118.35,35.05],
      "南充":[106.110698,30.837793],
      "天津":[117.2,39.13],
      "富阳":[119.95,30.07],
      "泰安":[117.13,36.18],
      "诸暨":[120.23,29.71],
      "郑州":[113.65,34.76],
      "哈尔滨":[126.63,45.75],
      "聊城":[115.97,36.45],
      "芜湖":[118.38,31.33],
      "唐山":[118.02,39.63],
      "平顶山":[113.29,33.75],
      "邢台":[114.48,37.05],
      "德州":[116.29,37.45],
      "济宁":[116.59,35.38],
      "荆州":[112.239741,30.335165],
      "宜昌":[111.3,30.7],
      "义乌":[120.06,29.32],
      "丽水":[119.92,28.45],
      "洛阳":[112.44,34.7],
      "秦皇岛":[119.57,39.95],
      "株洲":[113.16,27.83],
      "石家庄":[114.48,38.03],
      "莱芜":[117.67,36.19],
      "常德":[111.69,29.05],
      "保定":[115.48,38.85],
      "湘潭":[112.91,27.87],
      "金华":[119.64,29.12],
      "岳阳":[113.09,29.37],
      "长沙":[113,28.21],
      "衢州":[118.88,28.97],
      "廊坊":[116.7,39.53],
      "菏泽":[115.480656,35.23375],
      "合肥":[117.27,31.86],
      "武汉":[114.31,30.52],
      "大庆":[125.03,46.58]
    };
    if(data.length<=1) {
      return;
    }
    let newData = [];
    let zbName = '';
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;
      },0);
    }
    if(wd.length>=1 && zb.length>=1) {
      // 地图数据
      conData.forEach(item => {
        newData.push({name:item[wd[0]],value:item[zb[0]]});
      });
      // 指标名称
      zbName = headData[0][zb[0]];
    }
    this.dataHandleSer.getMapJsonByName().subscribe((chinaJson) => {
       // console.log(chinaJson);
       this.chinaMapOption(chinaJson,geoCoordMap,newData,zbName);
    });

  }
  // 散点图options
  makeScatterOption(data,zb,gl) {
    if(data.length<=1) {
      return;
    }
    let zbList = [];
    let newData = [];
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    const that = this;
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;

      },0);
    }
    // 指标列表
    zb.forEach(v => {
       zbList.push(headData[0][v]);
    });
    // 数据
    conData.forEach(item => {
        let tmp = [];
        zb.forEach(z => {
           tmp.push(item[z]);
        });
      newData.push(tmp);
    });
    this.options = {
      legend: {
        left: 'left',
        data: zbList
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {
            readOnly: false,
            optionToContent : function(opt) {
              return that.getDataView(opt);
            }
          },
          saveAsImage: {}
        }
      },
      xAxis: {
        name: zbList[0] || '',
        nameTextStyle: {
          fontWeight:'bold'
        }
      },
      yAxis: {
        name: zbList[1] || '',
        nameTextStyle: {
          fontWeight:'bold'
        }
      },
      series: [{
        symbolSize: 20,
        data: newData,
        type: 'scatter'
      }]
    };
  }
  // 雷达图
  makeRedarOption(data,wd,zb,gl) {
    if(data.length<=1) {
      return;
    }
    let zbList = [];
    let wdList = [];
    let newData = [];
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    const that = this;
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;

      },0);
    }
    // 指标列表
    zb.forEach(v => {
      zbList.push(headData[0][v]);
    });
    // 维度
    if(wd.length>=1) {
      conData.forEach(v => {
        wdList.push({name:v[wd[0]]});
      });
    }
    // 数据值
    zb.forEach(v => {
       newData.push({
         name: headData[0][v],
         value: conData.map(item => item[v])
       })
    });
    this.options = {
      legend: {
        data: zbList,
        left:'left'
      },
      toolbox: {
        feature: {
          dataView: {
            readOnly: false,
            optionToContent : function(opt) {
              return that.getDataView(opt);
            }
          },
          restore: {},
          saveAsImage: {}
        }
      },
      radar: {
        name: {
          textStyle: {
            color: '#fff',
              backgroundColor: '#999',
              borderRadius: 3,
              padding: [3, 5]
          }
        },
        indicator: wdList
      },
      series: [{
        // name: '预算 vs 开销（Budget vs spending）',
        type: 'radar',
        data : newData
      }]
    };
  }
  // 漏斗图
  makeFunnelOption(data,wd,zb,gl) {
    if(data.length<=1) {
      return;
    }
    let newData = [];
    let wdList = [];
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    const that = this;
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;
      },0);
    }
    // 维度
    if(wd.length>=1 && zb.length>=1) {
      wdList = conData.map(item => item[wd[0]]);
      // 数据
      conData.forEach(item => {
        newData.push({name:item[wd[0]],value:item[zb[0]]});
      });
    }
    this.options = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c}%"
      },
      toolbox: {
        feature: {
          dataView: {
            readOnly: false,
            optionToContent : function(opt) {
              return that.getDataView(opt);
            }
          },
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        data: wdList
      },
      calculable: true,
      series: [
        {
          name:'漏斗图',
          type:'funnel',
          left: '10%',
          top: 60,
          //x2: 80,
          bottom: 60,
          width: '80%',
          // height: {totalHeight} - y - y2,
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            normal: {
              show: true,
              position: 'inside'
            },
            emphasis: {
              textStyle: {
                fontSize: 20
              }
            }
          },
          labelLine: {
            normal: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            }
          },
          itemStyle: {
            normal: {
              borderColor: '#fff',
              borderWidth: 1
            }
          },
          data: newData
        }
      ]
    };
  }
  // 仪表盘
  makeGaugeOption(data,wd,zb,gl) {
    if(data.length<=1) {
      return;
    }
    let newData = [];
    let wdList = [];
    const headData = data.slice(0,1);
    const conData = data.slice(1,5);
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;
      },0);
    }
    if(wd.length>=1 && zb.length>=1) {
      conData.forEach(item => {
        newData.push({
          name: headData[0][wd[0]],
          type: 'gauge',
          detail: {formatter:'{value}%'},
          data: [{value: item[zb[0]], name:  item[wd[0]]}],
          radius:'50%'
        });
      });
      if(newData.length===1) {
        newData[0].radius = '80%';
      } else if(conData.length===2) {
        newData.forEach((item,i) => {
            item.radius = '60%';
            if(i==1) {
              item.center = ['25%','50%'];
            } else {
              item.center = ['75%','50%'];
            }
        });
      } else if(conData.length===3) {
        newData.forEach((item,i) => {
          item.radius = '50%';
          if(i==1) {
            item.center = ['25%','30%'];
          } else if(i==2) {
            item.center = ['75%', '30%'];
          } else {
            item.center = ['50%','75%'];
          }
        });
      } else {
        newData.forEach((item,i) => {
          item.radius = '50%';
          if(i==1) {
            item.center = ['25%','30%'];
          } else if(i==2) {
            item.center = ['25%', '75%'];
          } else if(i==3) {
            item.center = ['75%','30%'];
          } else {
            item.center = ['75%','75%'];
          }
        });
      }
    }

    this.options =  {
      tooltip : {
        formatter: "{a} <br/>{b} : {c}%"
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {}
        }
      },
      series: newData
    };
  }
  // 一维数据去重
  groupOne(arr) {
    return Array.from(new Set(arr));
  };
  // 获取当前时间
  getFormatDate(time?:any):string {
    // const nowDate = new Date();
    let nowDate;
    if(time) {
      nowDate = new Date(time);
    } else {
      nowDate = new Date();
    }
    return nowDate.getFullYear() +'-'+(nowDate.getMonth()+1) +'-'+ nowDate.getDate();
  }
  // 获取表数据
  getTableData(tableId,isWorkDay=0) {
    if(tableId ===undefined) {
      return;
    }
    let startDate = '';
    let endDate = '';
    if(this.defaultStartTime && this.defaultEndTime) {
        startDate = this.getFormatDate(this.defaultStartTime);
        endDate = this.getFormatDate(this.defaultEndTime);
    } else {
        const res = this.getTimeRange(14,1);
        startDate = this.getFormatDate(res.start);
        endDate = this.getFormatDate(res.end);
    }
    this.chartId = tableId;
    this.isLoading = true;
    this.chageSer.getDataByTableId(tableId,startDate,endDate,isWorkDay).subscribe(res => {
      // console.log(res);
      if(res && res.data) {
        const {attribute,tabledata} = res.data;
        let xAix = [];
        let chartType = 'bar';
        let jq = [];
        if(attribute) {
          if(attribute.head_name) {
            let newStr = attribute.head_name.replace(/[;；]/g,';');
            xAix = newStr.split(';');
          }
          if(attribute.chart_type) {
            const findChart = this.chartTypes.filter(item => item.id == attribute.chart_type);
            if(findChart && findChart.length>0) {
              chartType = findChart[0].type;
              this.currentType = chartType;
            }
          }
        }
        if(tabledata && tabledata.length>=1) {
          this.initChart(tabledata,chartType,attribute);
        } else {
          this.axisList = xAix;
          this.initChart([],chartType,'');
        }
        this.currentData = tabledata;
        this.currentAttr = attribute;
      }
      this.isLoading = false
    },(err: HttpErrorResponse) => {
      const errMsg = (err && err.error.errorMsg) || '获取图表数据失败！';
      this.appNotification.error(errMsg);
      this.isLoading = false;
    });
  }
  // 搜索范围
  print(e) {
    e.preventDefault();
    if(this._startDate && this._endDate) {
      this.defaultStartTime = this._startDate.getTime();
      this.defaultEndTime  = this._endDate.getTime();
      console.log(`startDate:${this.defaultStartTime},endDate:${this.defaultEndTime}`);
      const isWorkDay = this.isWorkDay? 1: 0;
      this.getTableData(this.tableId,isWorkDay);
    }
    this.clearData();
  }

  /**
   *  筛选过滤数据
   * @param dwData 原始数据
   * @param gl 过滤文本
   */
  shai(dwData,gl) {
    const sk = {canCate:[],noCate:[]};
    if(dwData.length<=0 || !gl) {
      return sk;
    }
    gl = gl.replace(/；/g,';');
    const headData = dwData.slice(0,1)[0];
    const bodyData = dwData.slice(1);
    const arr = gl.split(';');
    arr.map(v => {
      return v.split(':');
    }).forEach(v => {
      const key = +v[0];
      const val = +v[1];
      if(val===1) {
        const arr1 =bodyData.map(k => {
          return k[+v[0]];
        });
        sk.canCate.push({index:key,name:headData[key],list:this.groupOne(arr1),multiples:[]});
      } else {
        sk.noCate.push({index:key,name:headData[+v[0]],value:'',c:'>'});
      }
    });
    // console.log(sk);
    return sk;
  }
  /**
   * 处理过滤条件
   * @param canCate 分组列表
   * @param noCate 未分组列表
   * @param allData 不包含表头数据项
   *
   */
  handleGvData(canCate,noCate,allData):Promise<any> {
    return new Promise((resolve) => {
      let headData = allData.slice(0,1);
      let arr = allData.slice(1);
      // 可分组数据过滤
      canCate.forEach(v => {
        if(v.multiples.length>0) {
          arr = arr.filter(item => {
            return v.multiples.indexOf(item[v.index])>=0;
          });
        }
      });
      const suan = function(a,b,type) {
        let isTrue = true;
        switch(type) {
          case '>':
            isTrue = a>b;
            break;
          case '>=':
            isTrue = a>=b;
            break;
          case '=':
            isTrue = a=b;
            break;
          case '<':
            isTrue =  a<b;
            break;
          case '<=':
            isTrue = a<=b;
            break;
          default:
            isTrue = false
        }
        return isTrue;
      };
      const reg = /^-?[1-9]\d*$/;
      noCate.forEach(v => {
        if(v.value && reg.test(v.value)) {
          arr = arr.filter(item => {
            return suan(item[v.index],+v.value,v.c);
          });
        }
      });
      if(headData.length>0) {
        arr.unshift(headData[0]);
      }
      resolve(arr);
    });
  }
  /**
   *  一维数据数据处理
   * @param data 原始数据
   * @param wd 维度
   * @param zb 指标
   * @param gl gl 原始字符串，etg：1:0;2:1
   * @param type 图表类型
   */
  dimensionSingle(data,wd,zb,gl,type):WzInfo {
    const zbList = zb;
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    const res = {
        zbList: [],
        axisList: [],
        seriesList: []
    };
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;

      },0);
    }
    // 指标
    if(headData.length>0) {
      res.zbList = headData[0].slice(zbList[0]);
    }
    // 横轴 跟 数据集合
    if(conData.length>0) {
      // 横轴
      if(wd[0]) {
        res.axisList = conData.map(item => {
          return item[+wd[0]];
        });
      }
      // 数据集合
      zbList.forEach((v,index) => {
        res.seriesList.push({
          name: res.zbList[index],
          type: type,
          data: conData.map(d => d[v])
        });
      });
    }
    return res;
  }
  /**
   *  多维数据数据处理
   * @param data 原始数据
   * @param wd 维度
   * @param zb 指标
   * @param gl gl 原始字符串，etg：1:0;2:1
   * @param type 图表类型
   */
  dimensionMutile(data,wd,zb,gl,type):WzInfo {
    const wdList = wd;
    const zbList = zb;
    const headData = data.slice(0,1);
    const conData = data.slice(1);
    const res = {
      zbList: [],
      axisList: [],
      seriesList: []
    };
    // 筛选条件
    if(this.isGlShow) {
      setTimeout(() => {
        const {canCate,noCate} = this.shai(data,gl);
        this.canCate = canCate;
        this.noCate = noCate;
      },0);
    }
    // 指标
    if(headData.length>0) {
      res.zbList = headData[0].slice(zbList[0]);
    }
    // 横轴 跟数据集合
    if(conData.length>0) {
     // 横轴
      res.axisList = conData.map(v => {
        let newStr = '';
        wdList.forEach((k,i) => {
          if(i!==0) {
            newStr+= '~' +v[k];
          } else {
            newStr+= v[k];
          }

        });
        return newStr;
      });
      // 指标
      zbList.forEach((v,index) => {
        res.seriesList.push({
          name: res.zbList[index],
          type: type,
          data: conData.map(d => d[v])
        });
      });
    }
    return res;
  }
  /**
   *
   * @param dataAxis 坐标横轴
   * @param data 数据库原始数据
   * @param cType 图表类型
   * @param attribute 图表的配置参数
   */
  initChart(data,cType='bar',attribute:ChartConfig|any) {
    if(data.length<=1) {
      this.emptyChart();
      return;
    }
    // 获取出来维度和指标
    let zb = []; // 指标
    let wd = []; // 维度
    let gl = ''; // 过滤参数
    if(attribute) {
      zb = attribute.chart_value_index.split(';');
      wd = attribute.chart_name_index.split(';');
      try {
        let {attrFilter} =JSON.parse(attribute.ext_attribute);//"{"chat_name_show":1,"attrFilter":"0:1;1:1;2:1"}"
        gl = attrFilter;
        if(gl) {
          this.isGlShow = true;
        } else {
          this.isGlShow = false;
        }
      } catch (err) {
        console.log(err);
        gl ='';
      }
    }
    this.currentWd = wd;
    let pz:WzInfo;// 横轴、指标、数据集
    if(cType==='bar' || cType==='line' || cType==='pie') {
      if(wd.length>1) {
        pz = this.dimensionMutile(data,wd,zb,gl,cType);
      } else {
        pz = this.dimensionSingle(data,wd,zb,gl,cType);
      }
      this.createOptions(pz,wd,cType);
    } else if(cType==='map') {
      this.chinaMap(data,wd,zb,gl);
    } else if(cType==='scatter') {// 散点图
      if(zb.length<=1) {
        this.appNotification.error('散点图必须包含两项指标');
        return;
      }
      this.makeScatterOption(data,zb,gl);
    } else if(cType==='redar') {// 雷达图
      this.makeRedarOption(data,wd,zb,gl);
    } else if(cType==='funnel') {// 漏斗图
      this.makeFunnelOption(data,wd,zb,gl);
    } else if(cType==='gauge') {// 仪表盘
      this.makeGaugeOption(data,wd,zb,gl);
    } else {}
  }
  // 空数据chart
  emptyChart() {
    this.options= {
      xAxis: {
      },
      yAxis: {
        type: 'category'
      },
      graphic: [{
        type: 'group',
        rotation: 0,
        bounding: 'raw',
        left: 'center',
        bottom: 'center',
        z: 100,
        children: [
          {
            type: 'rect',
            left: 'center',
            top: 'center',
            z: 100,
            shape: {
              width: 200,
              height: 30
            },
            style: {
              fill: 'rgba(0,0,0,0.2)'
            }
          },
          {
            type: 'text',
            left: 'center',
            top: 'center',
            z: 100,
            style: {
              fill: '#fff',
              text: '表格无数据',
              font: 'bold 18px Microsoft YaHei'
            }
          }
        ]
      }]
    };
  }
  // 构造options
  createOptions(pz:WzInfo,wd,cType) {
    const that = this;
    if(cType==='pie') {
      const pieArr = [];
      pz.seriesList.forEach(item => {
        let count = item.data.reduce(function getSum(total, num) {
          return total + num;
        });
        pieArr.push({value:count,name:item.name});
      });
      this.options = {
        tooltip : {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)"
        },
        toolbox: {
          show: true,
          feature: {
            dataView: {
              readOnly: false,
              optionToContent : function(opt) {
                return that.getDataView(opt);
              }
            },
            saveAsImage: {}
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: pz.zbList
        },
        series : [
          {
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:pieArr,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    } {
      this.options = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: pz.zbList
        },
        xAxis: {
          type:'category',
          data: pz.axisList,
          axisLabel: {
            inside: false,
            textStyle: {
              color: '#999'
            },
            formatter: '{value}'
          },
          axisTick: {
            show: true
          },
          axisLine: {
            show: false
          },
          z: 10
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: true
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
        toolbox: {
          show: true,
          feature: {
            dataView: {
              readOnly: false,
              optionToContent : function(opt) {
                return that.getDataView(opt);
              }
            },
            magicType: {type: ['line', 'bar']},
            saveAsImage: {}
          }
        },
        series: pz.seriesList
      };
      if(wd.length>1) {
        this.options.xAxis.axisLabel = {
          interval:0,
          rotate:20, // 文字旋转角度
          textStyle: {
            color: '#999'
          }
        }
      } else {

      }
    }
    this.axisList = pz.axisList;
  };
  // 弹出过滤条件界面
  showGlModal(contentTpl,footerTpl) {
    this.currentModal = this.modalService.open({
      title       : '过滤条件',
      content     : contentTpl,
      footer      : footerTpl,
      maskClosable: false,
      onOk() {
        console.log('Click ok');
      }
    });
  }
  // 弹出搜索条件
  showSearchModal(contentTpl,footerTpl) {
    this.currentModal = this.modalService.open({
      title       : '搜索条件',
      content     : contentTpl,
      footer      : footerTpl,
      maskClosable: false,
      onOk() {
        console.log('Click ok');
      }
    });
  }
  // 清除对话框
  clearData () {
    this.currentModal.destroy('onOk');
    this.isConfirmLoading = false;
    this.currentModal = null;
  }
  // 保存过滤条件
  saveGlInfo(e) {
    e.preventDefault();
    this.isConfirmLoading = true;
    this.handleGvData(this.canCate,this.noCate,this.currentData)
      .then(newArr => {
        // console.log(newArr);
         this.initChart(newArr,this.currentType,this.currentAttr);
        this.clearData();
      })
      .catch(err => {
      console.log(err);
    });
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
