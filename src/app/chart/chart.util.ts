import { Injectable} from '@angular/core';
import {QueryResult} from "../common/model/card/query.meta.model";
import { DataHandleService } from '../changan/data.handle.service';
/**
 * Created by houxh on 2017-2-16.
 */
@Injectable()
export class ChartUtil {
  constructor(private dataHandleSer: DataHandleService) {
  }
  private _xAxisTitle = '';
  private _yAxisTitle = '';
  //报表展示方式 table txt chart
  private _showType = 'table';
  //图表chart类型：bar line etc.
  private _chartType = 'bar';
  private chartShowType:string;
  public measureCount = 0;
  public selectColumnCount = 0;
  public selectRowCount=0;
  chart: any;
  options = {
    chart: {
    },
    title: {
      text: ''
    },
    colors: ['#348ea9', '#f48c37', '#53bb9b', '#f04946', '#8562a3', '#5a868f', '#e51f61', '#9ab9be', '#eea366', '#ed5b58'],//,'#265e97'
    // colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
    //   '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],//['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', 'rgb(181, 160, 222)', 'rgb(0, 128, 255)', 'rgb(0, 128, 0)', 'rgb(255, 0, 128)'],
    legend: {
      align: 'center',
      verticalAlign: 'top',
      enabled: true
    },
    exporting: {
      enabled: false
    },
    colorAxis: {
      showInLegend: false,
      min: 0,
      minColor: '#FFFFFF',
      maxColor: '#348ea9'
    },
    plotOptions: {},
    tooltip: {
      shared: true,
      formatter: function () {
        if (this.point) {
          if (this.point.series.type == 'pie') {
            return `<b style="color:${this.point.color};font-weight: bold;">${this.point.series.name}</b><br>${this.point.name}: <b>${this.point.percentage.toFixed(2)}%</b>`;
          } else if (this.point.series.type == 'bubble') {
            return `<b style="color:${this.point.color};font-weight: bold;">${this.point.series.name}</b><br>(${this.point.x},${this.point.y}),Size:${this.point.z}`;
          } else if (this.point.series.type == 'scatter') {
            return `<b style="color:${this.point.color};font-weight: bold;">${this.point.series.name}</b><br><b>${this.point.series.xAxis.axisTitle.textStr}:</b>${this.point.x}<br>
                    <b>${this.point.series.yAxis.axisTitle.textStr}:</b>${this.point.y}`;
          } else if (this.series.type == 'heatmap') {
            return `<b>x:${this.series.xAxis.categories[this.point.x]}</b><br><b>y:${this.series.yAxis.categories[this.point.y]}</b> <br><b>${this.point.value}</b>`;
          }else if(this.series.type == 'map'){
            let str= '<b>'+this.point.name+'</b><br>'+
              '全称:'+this.point.properties.fullname+'<br>' +
            '行政编号:'+this.point.properties.areacode+'<br>' +
            '父级:'+this.point.properties.parent+'<br>' +
            '值:'+this.point.value;
            return str;
          }
        }
        else if (this.points) {
          if (this.points) {
            let ponitValue = 0;
            let pointName;
            let seriesName = '';
            let str = '';
            // let x=this.x;
            this.points.forEach(p => {
              // if(p.key==x){
              ponitValue = p.series.yData[p.point.x];
              pointName = p.category;
              seriesName = p.series.name;
              if(isNaN(p.y)) {
                str += `<b style="color:${p.color};font-weight: bold;">${seriesName}</b><br>${p.x}: <b>${p.y}</b><br/>`;
              }else{
                let value=p.y.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1,");
                str += `<b style="color:${p.color};font-weight: bold;">${seriesName}</b><br>${p.x}: <b>${value}</b><br/>`;
              }
              // }
            })
            return str;//'<b>'+seriesName+'</b><br>'+x+': <b>'+ponitValue+'</b>';
          }

        }
      }
    },
    xAxis: {
      title: {text: this._xAxisTitle},
      categories: [],
      visible: true,
      gridLineWidth: 1
    },
    yAxis: {
      title: {text: ''},
      categories: [],
      gridLineWidth: 1,
      visible: true,
      allowDecimals:false,
      tickAmount:30,
      labels:{
        enabled:true,
        formatter:function(){
          if(this.value>100000000){
            if(this.value/100000000>100){
              return (this.value/1000000000).toFixed(0)+'0亿';
            }else{
              return (this.value/100000000).toFixed(0)+'亿';
            }
          }else if(this.value>10000){
            if(this.value/10000>100){
              return (this.value / 100000).toFixed(0)+'0万';
            }else {
              return (this.value / 10000).toFixed(0)+'万';
            }
          }else{
            return this.value;
          }
        },
      },
    },
    credits: {
      enabled: false
    },
    series: []
  };
  inputChartType: string;

  /**
   *  card页 chart数据处理
   * @param cardResult 结果数据 CardResult or QueryResult
   * @param chartType 图表类型
   * @param chart highchart对象
   * @param queryType card类型，默认olap（olap,query）
   */
  handleData(cardResult: any, chartType: string, chart: any, queryType?: string): void {
    console.log('chart loading...',chartType);
    this.inputChartType = chartType;
    this.chart = chart;
    if (queryType == 'SQL') {
      this.operateChart(cardResult, chartType, queryType);
    } else {
      if (cardResult && cardResult.cellset && cardResult.cellset.length > 0) {
        this.getChartProperties(cardResult.query.properties['saiku.ui.chart.options']);
        let cellSet = cardResult.cellset;
        this.operateChart(cellSet, chartType, queryType);
      }
    }

  }

  /*
   cardlist page show
   */
  /**
   *
   * @param cellSet
   * @param chartType
   * @param chart
   * @param queryType
   */
  cardSummaryData(cellSet: any, chartType: string, chart: any, queryType?: string): void {
    this.inputChartType = chartType;
    this.chart = chart;
    this.operateChart(cellSet, chartType, queryType);
  }

  /*
   根据chart type处理options
   */
  operateChart(result: any, chartType: string, queryType: string) {
    if (queryType == 'SQL') {
      this.dataHandleSer.createQueryUtil(this.options).subscribe((res) => {
        let queryUtil = res;
        queryUtil.operateChartData(result, chartType);
      },(err) => {
        console.log(err);
      });

    } else {
      this.dataHandleSer.createOlapUtil(this.options).subscribe((res) => {
        let olapUtil = res;
        olapUtil.operateChartData(result, chartType);
      },(err) => {
        console.log(err);
      });
    }

    // delete this.options.yAxis['categories'];
    if (chartType == 'bar') {//竖柱分组图
      // this.options.chart.type = 'column';
      this.chartShowType='column';
      this.options.plotOptions = {column: {stacking: ''}};
    } else if (chartType == 'groupHorizontalBar') {//横柱分组图
      // this.options.chart.type = 'bar';
      this.chartShowType='bar';
      this.options.plotOptions = {bar: {stacking: ''}};//{'bar':{'stacking':'normal'}};
    } else if (chartType == 'verticalStackedBar' || chartType == 'mixChart') {//竖柱堆积图
      // this.options.chart.type = 'column';
      this.chartShowType='column';
      this.options.plotOptions = {column: {stacking: 'normal'}};
    } else if (chartType == 'horizontalStackedBar') {//横柱堆积图
      // this.options.chart.type = 'bar';
      this.chartShowType='bar';
      this.options.plotOptions = {bar: {stacking: 'normal'}};
    } else if (chartType == 'verticalNormalizedBar') {//竖柱百分比图
      // this.options.chart.type = 'column';
      this.chartShowType='column';
      this.options.plotOptions = {column: {stacking: 'percent'}};
    } else if (chartType == 'line') {//折线图
      // this.options.chart.type = 'line';
      this.chartShowType='line';
      this.options.plotOptions = {};
    } else if (chartType == 'area') {//区域图
      // this.options.chart.type = 'area';
      this.chartShowType='area';
      this.options.plotOptions = {area: {stacking: ''}};
    } else if (chartType == 'stackedArea') {//堆积区域图
      // this.options.chart.type = 'area';
      this.chartShowType='area';
      this.options.plotOptions = {area: {stacking: 'normal'}};
    } else if (chartType == 'normalizedArea') {//百分比区域图
      // this.options.chart.type = 'area';
      this.chartShowType='area';
      this.options.plotOptions = {area: {stacking: 'percent'}};
    }
    else if (chartType == 'pie' || chartType == 'pie-circle' || chartType == 'pie-semi-circle' || chartType == 'pie-donut') {//饼图
      // this.options.chart.type = 'pie';
      this.chartShowType='pie';
      this.options.plotOptions = {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: true,
          tooltip: {
            borderColor: '#000000',
            headerFormat: '{series.name}<br>',
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
          }
        }
      }
    }
    else if (chartType == 'singleHorizontalBar' || chartType == 'singleVerticalBar') {
      if (chartType == 'singleHorizontalBar') {
        // this.options.chart.type = 'bar';
        this.chartShowType='bar';
        this.options.plotOptions = {column: {stacking: ''}};
      } else {
        // this.options.chart.type = 'column';
        this.chartShowType='column';
        this.options.plotOptions = {column: {stacking: ''}};
      }
      this.options.series.splice(1, this.options.series.length - 1);
    }
    else if (chartType == 'treeMap' || chartType == 'gauge') {
      // return this.singleBarData();
      // this.single=this.singleBarData();
    }
    else if (chartType == 'scatter') {
      // this.options.chart.type = 'scatter';
      this.chartShowType='scatter';
      this.options.plotOptions = {
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x}, {point.y}'
          }
        }
      };
    }
    else if (chartType == 'bubble') {
      // this.options.chart.type = 'bubble';
      this.chartShowType='bubble';
      this.options.plotOptions = {};
    }
    else if (chartType == 'polar-spider') {
      // this.options.chart['polar']=true;
      this.options.yAxis['gridLineInterpolation'] = 'polygon';
      this.options.yAxis['gridLineWidth'] = 1;
      this.options.xAxis['tickmarkPlacement'] = 'on';
      this.options.xAxis['lineWidth'] = 0;
      this.options.xAxis['gridLineWidth'] = 1;
    }
    else if (chartType == 'heatMap') {
      // this.options.chart.type = 'heatmap';
      this.chartShowType='heatmap';
      this.options.plotOptions = {};
    }
    else if(chartType=='china-map'){
      this.chartShowType='china-map';
      this.options['colorAxis']['labels']={
        style:{
          color:"red",
          fontWeight:"bold"
        }
      };
    }
    this.loadHightChart();
  }

  /*
   改变图表大小
   */
  changeView(x: number, y: number, chart?: any) {
    // if (!chart) {
      this.chart = chart;
    // }
    if (this.chartShowType == 'bar' || this.chartShowType == 'column' || this.chartShowType == 'line' || this.chartShowType == 'area') {
      let xgroupCount = this.options.series.length;
      if(xgroupCount<=0){
        return;
      }

      let xgroupMemberCount = this.options.series[0].data.length;
      let resizeX = 0;
      if (xgroupCount && xgroupMemberCount) {
        resizeX = xgroupCount * xgroupMemberCount * 10;
      }
      if(this.chartShowType == 'line' || this.chartShowType == 'area'){
        resizeX= xgroupMemberCount * 20;
      }
      if (this.chartShowType == 'bar') {
        if (y <= resizeX) {
          y = resizeX;
          x = x - 20;
        }

      } else {
        if (x <= resizeX) {
          x = resizeX;
        }

      }
    }
    y = y - 20;
    // console.log('chartType:',this.chartType);
    // if(this.chartType != 'bar'){
    //   this.chart['inverted'] = false;
    // }

    this.chart.setSize(x, y);
    // this.chart.update(this.options, true);
    this.chart.reflow();
  }

  loadHightChart() {
    if (this.chart) {
      let series = this.chart.series;
      // series=[];
      while (series.length > 0) {
        series[0].remove();
      }


      let totalSeries = this.options.series.length;
      this.options.series.forEach((s, n) => {
        this.setSeriesType(totalSeries, s, n);
        this.chart.addSeries(s, false);
      });
      this.chart['inverted'] = false;
      if (this.chartShowType === 'bar') {
        // 条形图切换是需要做一些特殊处理
        this.chart.xAxis[0].update({}, false);
        this.chart.yAxis[0].update({}, false);
        this.chart['inverted'] = true;
      }
      if (this.inputChartType === 'polar-spider') {
        this.chart['polar'] = true;
        // delete  this.options.chart['type'];
      } else {
        delete this.chart['polar'];
      }
      if (this.inputChartType != 'heatMap') {
        this.chart.yAxis[0].categories.splice(0,this.chart.yAxis[0].categories.length);
      }

      if(this.chartShowType=='pie'||this.inputChartType=='china-map'){
        this.options.yAxis.visible=false;
        this.options.xAxis.visible=false;
      }else{
        this.options.yAxis.visible=true;
        this.options.xAxis.visible=true;
      }
      this.chart.update(this.options, false);
      this.chart.redraw();
    }
  }

  setSeriesType(totalSeries: number, s: any, n: number) {
    //处理混合图显示
    if (this.inputChartType == 'mixChart') {
      if (totalSeries >= 3) {
        if (n == totalSeries - 1) {
          s['type'] = 'pie';
          s['size'] = '30%';
          s['center'] = ['15%', '15%'];
          s['showInLegend'] = false;
          s['dataLabels'] = {
            enabled: false
          };
          s['tooltip'] = {
            borderColor: '#000000',
            headerFormat: '{series.name}<br>',
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
          };

        } else if (n == totalSeries - 2) {
          s['type'] = 'line';
        } else {
          s['type'] = 'column';
        }
      }
      else {
        if (n == 0) {
          s['type'] = 'column';
        } else {
          s['type'] = 'line';
        }
      }
    }
    else if (this.inputChartType === 'polar-spider') {
      if (n != 0 && n % 2 != 0) {
        s['type'] = 'area';
      } else {
        s['type'] = 'line';
      }
    }else if(this.inputChartType === 'china-map'){
      // s['type'] = 'line';
    }
    else {
      s['type'] = this.chartShowType;
    }

    if (this.chartShowType == 'pie') {
        s['tooltip'] = {
          borderColor: '#000000',
          headerFormat: '{series.name}<br>',
          pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        };
        if (this.inputChartType == 'pie-circle') {
          s['innerSize'] = '60%';
        } else if (this.inputChartType == 'pie-semi-circle') {
          s['innerSize'] = '60%';
          s['startAngle'] = -90;
          s['endAngle'] = 90;
          s['center'] = ['50%', '75%'];
        }else if(this.inputChartType == 'pie-donut'){
          s['center'] = ['50%', '50%'];
          if(n==0){
            s['size']= '50%'
          }else{
            s['innerSize']= '60%'
          }
        }

    }
    else if (this.chartShowType == "heatmap") {
      s['borderWidth'] = 1;
      s['dataLabels'] = {
        enabled: true,
        color: '#000000'
      };
    }
  }

  get colorScheme(): any {
    return this.options.colors;
  }

  set colorScheme(colors: any) {
    this.options.colors = colors;
  }

  get xAxisLabel(): string {
    return this._xAxisTitle;
  }

  set xAxisLabel(xAxisTitle: string) {
    this._xAxisTitle = xAxisTitle;
    this.options.xAxis.title.text = this._xAxisTitle;
  }

  get showXAxisLabel(): boolean {
    return this.options.xAxis.title.text == '' ? false : true;
  }

  set showXAxisLabel(show: boolean) {
    if (show) {
      this.options.xAxis.title.text = this._xAxisTitle;
    } else {
      this.options.xAxis.title.text = '';
    }
  }

  get yAxisLabel(): string {
    return this._yAxisTitle;
  }

  set yAxisLabel(yAxisTitle: string) {
    this._yAxisTitle = yAxisTitle;
    this.options.yAxis.title.text = this._yAxisTitle;
    // this.loadHightChart();
  }

  get showYAxisLabel(): boolean {
    return this.options.xAxis.title.text == '' ? false : true;
  }

  set showYAxisLabel(show: boolean) {
    if (show) {
      this.options.yAxis.title.text = this._yAxisTitle;
    } else {
      this.options.yAxis.title.text = null;
    }
  }


  get showXAxis(): boolean {
    if (this.options.xAxis.gridLineWidth == 0) {
      return false;
    } else {
      return true;
    }
  }

  set showXAxis(show: boolean) {
    // this.options.xAxis.visible = show;
    if (show) {
      this.options.xAxis.gridLineWidth = 1;
    } else {
      this.options.xAxis.gridLineWidth = 0;
    }
  }

  get showYAxis(): boolean {
    if (this.options.yAxis.gridLineWidth == 0) {
      return false;
    } else {
      return true;
    }

  }

  set showYAxis(show: boolean) {
    if (show) {
      this.options.yAxis.gridLineWidth = 1;
    } else {
      this.options.yAxis.gridLineWidth = 0;
    }
  }

  get showLegend(): boolean {
    return this.options.legend.enabled;
  }

  set showLegend(show: boolean) {
    this.options.legend.enabled = show;
  }

  get showType(): string {
    return this._showType;
  }

  set showType(showType: string) {
    this._showType = showType;
  }

  get chartType(): string {
    return this._chartType;
  }

  set chartType(chartType: string) {
    this._chartType = chartType;
  }


  multi = [];
  single = [];

  changePickerColor(color: string, i: number) {
    this.colorScheme[i] = color;
    this.loadHightChart();
  }

  changeShowAxisLabel(b: boolean, direction: string) {
    if (direction === 'x') {
      this.showXAxisLabel = b;
    } else {
      this.showYAxisLabel = b;
    }
    this.loadHightChart();
  }

  changeShowAxis(b: boolean, direction: string) {
    if (direction === 'x') {
      this.showXAxis = b;
    } else {
      this.showYAxis = b;
    }
    this.loadHightChart();
  }

  changeChartAttribute(key: string, value: string) {
    this[key] = value;
    this.loadHightChart();
  }

  getChartProperties(chartPros): void {
    if (!chartPros)
      return;
    this.options.xAxis.gridLineWidth = chartPros.showXAxis == undefined ? 1 : (chartPros.showXAxis ? 1 : 0);
    this.options.yAxis.gridLineWidth = chartPros.showYAxis == undefined ? 1 : (chartPros.showYAxis ? 1 : 0);
    this.options.xAxis.title.text = chartPros.xAxisLabel;
    this._xAxisTitle = chartPros.xAxisLabel;
    this.options.yAxis.title.text = chartPros.yAxisLabel;
    this._yAxisTitle = chartPros.yAxisLabel;
    this.options.legend.enabled = chartPros.showLegend;
    // this.showXAxis=chartPros.showXAxis;
    // this.showYAxis=chartPros.showYAxis;
    this.showXAxisLabel = chartPros.showXAxisLabel;
    // this.xAxisLabel=chartPros.xAxisLabel;
    this.showYAxisLabel = chartPros.showYAxisLabel;
    // this.yAxisLabel=chartPros.yAxisLabel;
    this.colorScheme = chartPros.colorScheme;
    // this.showLegend=chartPros.showLegend;
  }
}

