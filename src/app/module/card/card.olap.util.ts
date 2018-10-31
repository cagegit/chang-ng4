import { Cell} from "../../common/model/card/card.resut";
import {ChartMetaData} from "./card.showchart";
import {QueryMeta} from "../../common/model/card/query.meta.model";
/**
 * Created by houxh on 2017-5-19.
 */
export class OlapUtil{
  metadata: Array<ChartMetaData> = new Array<ChartMetaData>();
  lowest_level = 0;
  data_start = 0; //0 未开始数据遍历 1开始遍历数据
  options:any;
  chinaData:any;
  constructor(options:any,chinaData:any){
    this.options=options;
    this.chinaData = chinaData;
  }

  /*
   根据chart type处理options
   */
  operateChartData(cellSet: Array<Cell[]>, chartType: string) {
    if (cellSet && cellSet.length > 0) {
      this.processHeader(cellSet);
      if (chartType.toLocaleLowerCase().indexOf('pie') >= 0) {
        if(chartType!='pie-donut') {
          this.pieData(cellSet);
        }else{
          //开始计算维度数量
          let curDims = new Set<string>();
          for (let head of cellSet) {
            if (head[0].type == 'ROW_HEADER_HEADER') {
              for(let ch of head){
                if(ch.type=='ROW_HEADER_HEADER'){
                  curDims.add(ch.value);
                }
              }
              break;
            }
          }
          if(curDims.size!=2)
            return;
          this.pieDonutData(cellSet,curDims);
        }
      }
      else if (chartType == 'scatter') {
        //开始计算measure数量
        let curMeasures = new Set<string>();
        for (let head of cellSet) {
          if (head[0].type == 'ROW_HEADER_HEADER') {
            for (let ch of head) {
              if (ch.type == 'COLUMN_HEADER') {
                curMeasures.add(ch.value);
              }
            }
            break;
          }
        }
        //如果指标个数!=2，中断执行
        if (curMeasures.size != 2)
          return;
        this.scatterData(cellSet, curMeasures);
      }
      else if (chartType == 'bubble') {
        //开始计算measure数量
        let curMeasures = new Set<string>();
        for (let head of cellSet) {
          if (head[0].type == 'ROW_HEADER_HEADER') {
            for (let ch of head) {
              if (ch.type == 'COLUMN_HEADER') {
                curMeasures.add(ch.value);
              }
            }
            break;
          }
        }
        //如果指标个数!=3，中断执行
        if (curMeasures.size != 3)
          return;
        this.bubbleData(cellSet, curMeasures);
      }
      else if (chartType == 'mixChart') {
        this.mixChartData(cellSet);
      }
      else if (chartType == 'heatMap') {
        //开始计算measure数量
        let curMeasures = new Set<string>();
        for (let head of cellSet) {
          if (head[0].type == 'ROW_HEADER_HEADER') {
            for (let ch of head) {
              if (ch.type == 'COLUMN_HEADER') {
                curMeasures.add(ch.value);
              }
            }
            break;
          }
        }
        //如果指标个数!=1，中断执行
        if (curMeasures.size != 1)
          return;
        this.heatMapData(cellSet, curMeasures);
      }
      else if(chartType=='china-map'){
        this.mapData(cellSet);
      }
      else {
        this.processData(cellSet);
      }
    }
  }

  mapData(cellset: Array<Cell[]>){
    let data=[];
    let mapData = this.chinaData;
    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    this.metadata.forEach(m => {
      if (m.colType == 'String') {
        rowHeaderLen++;
      }
    });
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      let value;
      if (!cellset[row][rowHeaderLen].value || cellset[row][rowHeaderLen].value == '') {
        value=0;
      } else {
        let val = cellset[row][rowHeaderLen] && cellset[row][rowHeaderLen].value.length > 0 ? cellset[row][rowHeaderLen].value : '0';
        value = Number(val.split(',').join(''));
      }
      mapData.features.forEach((md,index)=>{
        if(md.properties.name==cellset[row][0].value||md.properties.fullname==cellset[row][0].value) {
          data.push({
            name: md.properties.name,
            // drilldown: md.properties.filename, // 赋值 drilldown
            value: value//Math.floor((Math.random() * 100) + 1) // 生成 1 ~ 100 随机值
          });
        }
      })
    }
    // mapData.features.forEach((md,index)=>{
    //   data.push({
    //     name: md.properties.name,
    //     // drilldown: md.properties.filename, // 赋值 drilldown
    //     value: Math.floor((Math.random() * 100) + 1) // 生成 1 ~ 100 随机值
    //   });
    // })
    this.options.series=[{
      data: data,
      mapData: mapData,
      joinBy: 'name',
      name: this.metadata[rowHeaderLen].colName,//'中国地图',
      states: {
        hover: {
          color: '#a4edba'
        }
      }
    }];
  }
  /*
   处理data header
   */
  processHeader(cellset: Array<Cell[]>) {
    this.metadata = [];
    this.data_start = 0;
    let hasStart = false;
    for (let row = 0, rowLen = cellset.length; this.data_start === 0 && row < rowLen; row++) {
      for (let field = 0, fieldLen = cellset[row].length; field < fieldLen; field++) {
        if (!hasStart) {
          while (cellset[row][field].type == "COLUMN_HEADER" && cellset[row][field].value == "null") {
            row++;
          }
        }
        hasStart = true;
        if (cellset[row][field].type == "ROW_HEADER_HEADER") {
          while (cellset[row][field].type == "ROW_HEADER_HEADER") {
            this.metadata.push({
              colIndex: field,
              colType: "String",
              colName: cellset[row][field].value
            });
            field++;
          }
          this.lowest_level = field - 1;
        }
        if (cellset[row][field].type == "COLUMN_HEADER") {
          var lowest_col_header = 0;
          var colheader = [];
          while (lowest_col_header <= row) {
            if (cellset[lowest_col_header][field].value !== "null") {
              colheader.push(cellset[lowest_col_header][field].value);
            }
            lowest_col_header++;
          }
          this.metadata.push({
            colIndex: field,
            colType: "Numeric",
            colName: colheader.join('~')
          });
          this.data_start = row + 1; //如果找到COLUMN_HEADER，那么循环结束，下一行开始遍历数据
        }
      }
    }
  }

  /**
   *  通用图数据， column,bar,line,area etc
   * @param cellset
   */
  processData(cellset: Array<Cell[]>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    this.metadata.forEach(m => {
      if (m.colType == 'String') {
        rowHeaderLen++;
      }
    })
    this.metadata.splice(0, rowHeaderLen);
    this.metadata.forEach(m => {
      arrData.push({
        name: m.colName,
        data: []
      });
    })
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      let rowArr = [];
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          let rowTitle = [];
          while (field < rowHeaderLen) {
            rowTitle.push(cellset[row][field].value);
            field++;
          }
          this.options.xAxis.categories.push(rowTitle.join('~'));
        }
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          arrData[field - rowHeaderLen].data.push(0);
        } else {
          let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
          let val1 = Number(val.split(',').join(''));
          arrData[field - rowHeaderLen].data.push(val1);
        }
      }
    }
    this.options.series = arrData;
  }

  /*
   饼图数据
   */
  pieData(cellset: Array<Cell[]>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    let seriseName='';
    this.metadata.forEach(m => {
      if (m.colType == 'String') {
        seriseName+=m.colName+'~';
        rowHeaderLen++;
      }
    });
    arrData.push({
      name: seriseName.substr(0,seriseName.length-1),
      data: []
    });
    //开始遍历数据
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      let rowArr = [];
      let piePoint = {};
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          let rowTitle = [];
          while (field < rowHeaderLen) {
            rowTitle.push(cellset[row][field].value);
            field++;
          }
          rowArr.push(rowTitle.join('~'));
          piePoint['name'] = rowTitle.join('~');
        }
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          rowArr.push(0);
          piePoint['y'] = 0;
        } else {
          let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
          let val1 = Number(val.split(',').join(''));
          rowArr.push(val1);
          piePoint['y'] = val1;
        }
      }
      // arrData[0].data.push(rowArr);
      arrData[0].data.push(piePoint);
    }
    this.options.series = arrData;
  }
  /*
   饼图数据
   */
  pieDonutData(cellset: Array<Cell[]>,curDims:Set<string>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //数据列DATA_CELL开始索引
    let rowHeaderLen = curDims.size;
    let arrData = [];
    // this.metadata.forEach(m => {
    //   if (m.colType == 'String') {
    //     rowHeaderLen++;
    //   }
    // });
    this.metadata.forEach(m=>{
      if(m.colType=='String'){
        arrData.push({
          name: m.colName,
          data: []
        });
      }
    })

    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      let innerPoint = {};
      let outerPoint={};
      let v=0;
      if (!cellset[row][rowHeaderLen].value || cellset[row][rowHeaderLen].value == '') {
        v=0;
      } else {
        let val = cellset[row][rowHeaderLen] && cellset[row][rowHeaderLen].value.length > 0 ? cellset[row][rowHeaderLen].value : '0';
        v = Number(val.split(',').join(''));
      }
      //内圈数据
      if(row==this.data_start||cellset[row][0].value!=cellset[row-1][0].value){
        innerPoint={
          name:cellset[row][0].value,
          y:v
        };
        arrData[0].data.push(innerPoint);

      }
      else{
        arrData[0].data.forEach(sd=>{
          if(sd.name==cellset[row][0].value){
            sd.y+=v
          }
        });
      }
        //外环数据
        outerPoint={name:cellset[row][1].value,
          y:v
        };
        arrData[1].data.push(outerPoint);

    }

    this.options.series = arrData;
  }
  /*
   散点图数据
   */
  scatterData(cellset: Array<Cell[]>, curMeasures: Set<string>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //设置x,y轴显示
    let index = 0;
    curMeasures.forEach((m) => {
      if (index == 0) {
        this.options.xAxis.title.text = m;
      } else if (index == 1) {
        this.options.yAxis.title.text = m;
      }
      index++;
    });

    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    for (let i = rowHeaderLen; i < this.metadata.length; i++) {
      if (this.metadata[i].colType == 'String') {
        rowHeaderLen++;
      } else if (i >= rowHeaderLen && (i - rowHeaderLen) % 2 == 0) {
        let nameArr = this.metadata[i].colName.split('~');
        let nameStr = nameArr.splice(nameArr.length - 2, 1).join('~');
        arrData.push({
          name: nameStr,
          data: []
        });
      }
    }
    //开始遍历数据
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          continue;
        }
        let point = [];
        //x
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          point.push(0);
        } else {
          let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
          let val1 = Number(val.split(',').join(''));
          point.push(val1);
        }
        //y
        if (!cellset[row][field + 1].value || cellset[row][field + 1].value == '') {
          point.push(0);
        } else {
          let val = cellset[row][field + 1] && cellset[row][field + 1].value.length > 0 ? cellset[row][field + 1].value : '0';
          let val1 = Number(val.split(',').join(''));
          point.push(val1);
        }
        arrData[Math.floor((field - rowHeaderLen) / 2)].data.push(point);
        field++;
      }

    }
    this.options.series = arrData;
  }

  /*
   气泡图数据
   */
  bubbleData(cellset: Array<Cell[]>, curMeasures: Set<string>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //设置x,y轴显示
    let index = 0;
    curMeasures.forEach((m) => {
      if (index == 0) {
        this.options.xAxis.title.text = m;
      } else if (index == 1) {
        this.options.yAxis.title.text = m;
      }
      index++;
    });

    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    for (let i = rowHeaderLen; i < this.metadata.length; i++) {
      if (this.metadata[i].colType == 'String') {
        rowHeaderLen++;
      } else if (i >= rowHeaderLen && (i - rowHeaderLen) % 3 == 0) {
        let nameArr = this.metadata[i].colName.split('~');
        let nameStr = nameArr.splice(nameArr.length - 2, 1).join('~');
        arrData.push({
          name: nameStr,
          data: []
        });
      }
    }
    //开始遍历数据
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          continue;
        }
        let point = [];
        //x
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          point.push(0);
        } else {
          let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
          let val1 = Number(val.split(',').join(''));
          point.push(val1);
        }
        //y
        if (!cellset[row][field + 1].value || cellset[row][field + 1].value == '') {
          point.push(0);
        } else {
          let val = cellset[row][field + 1] && cellset[row][field + 1].value.length > 0 ? cellset[row][field + 1].value : '0';
          let val1 = Number(val.split(',').join(''));
          point.push(val1);
        }
        //z
        if (!cellset[row][field + 2].value || cellset[row][field + 1].value == '') {
          point.push(0);
        } else {
          let val = cellset[row][field + 2] && cellset[row][field + 2].value.length > 0 ? cellset[row][field + 2].value : '0';
          let val1 = Number(val.split(',').join(''));
          point.push(val1);
        }
        arrData[Math.floor((field - rowHeaderLen) / 2)].data.push(point);
        field += 2;
      }

    }
    this.options.series = arrData;
  }

  /*
   混合图，显示顺序：column、line、pie
   */
  mixChartData(cellset: Array<Cell[]>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [];
    this.metadata.forEach(m => {
      if (m.colType == 'String') {
        rowHeaderLen++;
      }
    })
    this.metadata.splice(0, rowHeaderLen);
    this.metadata.forEach(m => {
      arrData.push({
        name: m.colName,
        data: []
      });
    })
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      let piePoint = {};
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          let rowTitle = [];
          while (field < rowHeaderLen) {
            rowTitle.push(cellset[row][field].value);
            field++;
          }
          this.options.xAxis.categories.push(rowTitle.join('~'));
          piePoint['name'] = rowTitle.join('~');
        }
        if (field == cellset[row].length - 1) {
          if (!cellset[row][field].value || cellset[row][field].value == '') {
            arrData[field - rowHeaderLen].data.push(piePoint);
          } else {
            let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
            let val1 = Number(val.split(',').join(''));

            piePoint['y'] = val1;
          }
          arrData[field - rowHeaderLen].data.push(piePoint);
        } else {
          if (!cellset[row][field].value || cellset[row][field].value == '') {
            arrData[field - rowHeaderLen].data.push(0);
          } else {
            let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
            let val1 = Number(val.split(',').join(''));
            arrData[field - rowHeaderLen].data.push(val1);
          }
        }
      }
    }
    this.options.series = arrData;
  }

  /*
   热点图
   */
  heatMapData(cellset: Array<Cell[]>, curMeasures: Set<string>) {
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    this.options.yAxis.categories = [];
    //数据列DATA_CELL开始索引
    let rowHeaderLen = 0;
    let arrData = [{
      name: curMeasures.values().next().value,
      data: []
    }];
    this.metadata.forEach(m => {
      if (m.colType == 'String') {
        rowHeaderLen++;
      }
    })
    this.metadata.splice(0, rowHeaderLen);
    let yAxesCategories = [];
    this.metadata.forEach(m => {
      if (m.colType == 'Numeric') {
        let yAxesArr = m.colName.split('~');
        let yAxes = yAxesArr.splice(yAxesArr.length - 2, 1).join('~');
        yAxesCategories.push(yAxes);
      }
    })
    this.options.yAxis['categories'] = yAxesCategories;
    for (let row = this.data_start, rowLen = cellset.length; row < rowLen; row++) {
      for (let field = 0; field < cellset[row].length; field++) {
        if (field < rowHeaderLen) {
          let rowTitle = [];
          while (field < rowHeaderLen) {
            rowTitle.push(cellset[row][field].value);
            field++;
          }
          this.options.xAxis.categories.push(rowTitle.join('~'));
        }
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          arrData[0].data.push([row - this.data_start, field - rowHeaderLen, 0]);
        } else {
          let val = cellset[row][field] && cellset[row][field].value.length > 0 ? cellset[row][field].value : '0';
          let val1 = Number(val.split(',').join(''));
          arrData[0].data.push([row - this.data_start, field - rowHeaderLen, val1]);
        }
      }
    }
    this.options.series = arrData;
  }

}
