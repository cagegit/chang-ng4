import {CardResult, Cell} from "../../common/model/card/card.resut";
/**
 * Created by houxh on 2016-12-8.
 */
export class ShowChart {
  view:Array<number>;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = "";
  showYAxisLabel = true;
  yAxisLabel = "";
  autoScale = true;
  colorScheme = {domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', 'rgb(181, 160, 222)', 'rgb(0, 128, 255)', 'rgb(0, 128, 0)', 'rgb(255, 0, 128)']};
  single:any[]=[];
  multi:any[]=[];
  gaugeValue:number=60;
  // pie properties start
  showLabels = true;
  //是否按比例显示扇行大小
  explodeSlices = false;
  //饼 or 环
  doughnut = false;
  // pie properties end
  //process data param start
  metadata:Array<ChartMetaData> = new Array<ChartMetaData>();
  reduceData = [];
  lowest_level = 0;
  data_start = 0; //0 未开始数据遍历 1开始遍历数据

  //process data param end
  constructor() {
  }

  changePickerColor(color:string, i:number) {
    this.colorScheme.domain[i] = color;
    this.colorScheme = Object.assign({}, this.colorScheme);
  }

  changeShowAxisLabel(b:boolean, direction:string) {
    if (direction === 'x') {
      this.showXAxisLabel = b;
    } else {
      this.showYAxisLabel = b;
    }
  }

  changeView(w:number, h:number) {
    this.view = [w, h];

  }

  handleData(cardResult:CardResult, chartType:string):void {
    if (cardResult &&cardResult.cellset && cardResult.cellset.length > 0) {
      let cellSet = cardResult.cellset;
      this.processHeader(cellSet);
      this.processData(cellSet);
      if (chartType=='bar'||chartType == 'groupHorizontalBar'||chartType == 'verticalStackedBar'
        ||chartType == 'horizontalStackedBar'||chartType == 'verticalNormalizedBar') {
        // return this.multiBarData();
        this.multi=this.multiBarData();
      } else if (chartType == 'line'||chartType == 'area'||chartType == 'stackedArea'||chartType == 'normalizedArea') {
        // return this.lineData();
        this.multi=this.lineData();
      }
      else if(chartType == 'singleHorizontalBar'||chartType=='singleVerticalBar'||chartType == 'treeMap'||chartType == 'pie'||chartType=='gauge'){
        // return this.singleBarData();
        this.single=this.singleBarData();
      }else{
        this.single=[];
        this.multi=[];
      }
    }else{
      this.single=[];
      this.multi=[];
    }
    // return [];
  }

  processHeader(cellset:Array<Cell[]>) {
    this.metadata=[];
    this.data_start=0;
    let hasStart=false;
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

  processData(cellset:Array<Cell[]>) {
    this.reduceData = [];

    let rowHeaderLen = 0;
    this.metadata.forEach(m=> {
      if (m.colType == 'String') {
        rowHeaderLen++
      }
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
          rowArr.push(rowTitle.join('~'));
        }
        if (!cellset[row][field].value || cellset[row][field].value == '') {
          rowArr.push(0);
        } else {
          let val = cellset[row][field].properties['raw'];
          rowArr.push(cellset[row][field].value);
        }
      }
      this.reduceData.push(rowArr);
    }
  }
  singleBarData():any{
    let singleBarDataObj = [];
    for (let i = 0; i < this.reduceData.length; i++) {
      let val = this.reduceData[i][1] && this.reduceData[i][1].length > 0 ? this.reduceData[i][1] : '0';
      val = Number(val.split(',').join(''));
      singleBarDataObj.push({
        name:this.reduceData[i][0],
        value: val
      });
    }
    return singleBarDataObj;
  }
  //multi bar data
  multiBarData():any {
    let multiBarDataObj = [];
    let rowHeaderLen = 0;
    let measureLen = 0;
    this.metadata.forEach(m=> {
      if (m.colType == 'String') {
        rowHeaderLen++;
      } else if (m.colType == 'Numeric') {
        measureLen++;
      }
    })
    for (let i = 0; i < this.reduceData.length; i++) {
      let barGroupObj = {
        "name": "",
        "series": []
      };
      for (let j = 0; j < this.reduceData[i].length; j++) {
        if (j == 0) {
          barGroupObj.name = this.reduceData[i][j];
        } else {
          // j-1+rowHeaderLen=metadataIndex,1表示reduceData[i]中的第一列
          let val = this.reduceData[i][j] && this.reduceData[i][j].length > 0 ? this.reduceData[i][j] : '0';
          val = Number(val.split(',').join(''));
          barGroupObj.series.push({
            name: this.metadata[j - 1 + rowHeaderLen].colName,
            value: val
          });
        }
      }
      multiBarDataObj.push(barGroupObj);
    }
    return multiBarDataObj;
  }

  //line or area data
  lineData():any {
    let lineDataObj = [];
    let rowHeaderLen = 0;
    this.metadata.forEach(m=> {
      if (m.colType == 'String') {
        rowHeaderLen++;
      }
    })
    for (let i = 0; i < this.metadata.length; i++) {
      if (this.metadata[i].colType == 'Numeric') {
        let lineGroupObj = {
          "name": this.metadata[i].colName,
          "series": []
        };
        for (let j = 0; j < this.reduceData.length; j++) {
          let valIndex = i - rowHeaderLen + 1;
          let val = this.reduceData[j][valIndex] && this.reduceData[j][valIndex].length > 0 ? this.reduceData[j][valIndex] : '0';
          val = Number(val.split(',').join(''));
          lineGroupObj.series.push({
            name: this.reduceData[j][0],
            value: val
          });
        }
        lineDataObj.push(lineGroupObj);
      }
    }
    return lineDataObj;
  }

}
export class ChartMetaData {
  colIndex:number;
  colType:string;
  colName:string;
}

