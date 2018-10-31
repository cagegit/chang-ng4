import { QueryMeta, QueryResult, QueryResultInfo } from "../../common/model/card/query.model";
import { HashMap } from "../../common/model/card/card.query.template";
import { CardUtils } from "./card.utils";
/**
 * Created by houxh on 2017-5-18.
 */
export class QueryUtil {
  options: any;
  measures: string[];
  chinaData:any;
  constructor(options: any,chinaData:any) {
    this.options = options;
    this.chinaData = chinaData;
  }

  operateChartData(queryResultInfo: QueryResultInfo, chartType: string) {
    if (!queryResultInfo || !queryResultInfo.queryResult || !queryResultInfo.queryResult.results || !queryResultInfo.queryResult.columnMetaList) {
      return;
    }
    //清空上次数据
    this.options.series = [];
    this.options.xAxis.categories = [];
    let data: any;
    if (chartType != 'pie-donut') {
      data = this.etlData(queryResultInfo);
    }
    else {
      //开始计算维度数量
      let curDims = new Set<string>();
      for (let i = 0; i < queryResultInfo.dimensionIndexs.length; i++) {
        curDims.add(queryResultInfo.queryResult.columnMetaList[queryResultInfo.dimensionIndexs[i].index].columnName);
      }
      if (curDims.size != 2)
        return;

      this.pieDonutData(queryResultInfo, curDims);
    }

    if (chartType.toLocaleLowerCase().indexOf('pie') >= 0) {
      if (chartType != 'pie-donut')
        this.pieData(data);
    } else if (chartType == 'china-map') {
      this.mapData(data);
    } else {
      this.processData(data);
    }
  }

  etlData(queryResultInfo: QueryResultInfo): HashMap<String, Number[]> {
    let metas = queryResultInfo.queryResult.columnMetaList;
    this.measures = [];
    for (let l = 0; l < queryResultInfo.measureIndexs.length; l++) {
      this.measures.push(metas[queryResultInfo.measureIndexs[l].index].columnName);
    }
    let data = queryResultInfo.queryResult.results;
    let groupDimDataMap = new HashMap<String, Number[]>();
    for (let i = 0, dataCount = data.length; i < dataCount; i++) {
      let row = data[i];
      let key = '';
      for (let k = 0; k < queryResultInfo.dimensionIndexs.length; k++) {
        // key += row[queryResultInfo.dimensionIndexs[k].index].toString();
        if (k == 0 || queryResultInfo.dimensionIndexs[k].index == queryResultInfo.dimensionIndexs[k - 1].index) {
          key += CardUtils.getKey(queryResultInfo.dimensionIndexs[k], metas[queryResultInfo.dimensionIndexs[k].index], row[queryResultInfo.dimensionIndexs[k].index].toString(), k);
        } else {
          key += '~' + CardUtils.getKey(queryResultInfo.dimensionIndexs[k], metas[queryResultInfo.dimensionIndexs[k].index], row[queryResultInfo.dimensionIndexs[k].index].toString(), k);
        }
      }
      if (key.lastIndexOf('~') == key.length - 1) {
        key = key.substr(0, key.length - 1);
      }
      if (groupDimDataMap.hasKey(key)) {
        let dimValues = groupDimDataMap.get(key);
        for (let m = 0; m < queryResultInfo.measureIndexs.length; m++) {
          let curValue = dimValues[m] == null ? 0 : dimValues[m];
          dimValues[m] = curValue + Number.parseFloat(row[queryResultInfo.measureIndexs[m].index].toString());
        }
      } else {
        let dimValues = [queryResultInfo.measureIndexs.length];
        for (let m = 0; m < queryResultInfo.measureIndexs.length; m++) {
          dimValues[m] = Number.parseFloat(row[queryResultInfo.measureIndexs[m].index].toString());
        }
        groupDimDataMap.add(key, dimValues);
      }
    }
    return groupDimDataMap;
  }

  mapData(data: HashMap<String, Number[]>) {
    let mapData = this.chinaData;
    let serieData = [];
    for (let key of data.allKeys()) {
      mapData.features.forEach(md => {
        if (md.properties.name == key || md.properties.fullname == key) {
          serieData.push({
            name: md.properties.name,
            // drilldown: md.properties.filename, // 赋值 drilldown
            value: data.get(key)[0]
          });
        }
      })
    }
    this.options.series = [{
      data: serieData,
      mapData: mapData,
      joinBy: 'name',
      name: this.measures[0],
      states: {
        hover: {
          color: '#a4edba'
        }
      }
    }];
  }
  /**
   * 通用图数据， column,bar,line,area etc
   * @param data
   */
  processData(data: HashMap<String, Number[]>) {
    let seriesDatas = [];
    for (let j = 0; j < this.measures.length; j++) {
      seriesDatas.push({
        name: this.measures[j],
        data: []
      });
      for (let key of data.allKeys()) {
        let rowData = data.get(key);
        for (let i = 0, rowCount = rowData.length; i < rowCount; i++) {
          if (j == i) {
            seriesDatas[j].data.push(rowData[i]);
          }
        }
      }
    }
    this.options.series = seriesDatas;
    this.options.xAxis.categories = data.allKeys();
  }

  /**
   * 饼图数据
   * @param data
   */
  pieData(data: HashMap<String, Number[]>) {
    let serieData = [];
    for (let key of data.allKeys()) {
      serieData.push([key, data.get(key)[0]]);
    }
    this.options.series.push({
      name: this.measures[0],
      data: serieData
    });
  }
  /**
   * 饼环图数据
   * @param data
   */
  pieDonutData(data: QueryResultInfo, curDims: Set<string>) {

    let serieData = [];
    curDims.forEach(d => {
      serieData.push({
        name: d,
        data: []
      });
    })
    let result = data.queryResult.results;
    let dim1Index = data.dimensionIndexs[0].index;
    let dim2Index = data.dimensionIndexs[1].index;
    let newDataArr = [];
    for (let i = 0; i < result.length; i++) {
      let rowData = [];
      if (i > 0 && (result[i][dim1Index].toString() == result[i - 1][dim1Index].toString() && result[i][dim2Index].toString() == result[i - 1][dim2Index].toString())) {

        newDataArr.forEach(newData => {
          if (newData[0].toString() == result[i][dim1Index].toString() && newData[1].toString() == result[i][dim2Index].toString()) {
            for (let j = 0; j < data.measureIndexs.length; j++) {
              let mIndex = data.measureIndexs[j].index;
              let originalData = isNaN(newData[mIndex]) ? 0 : newData[mIndex];
              let curData = isNaN(parseInt(result[i][mIndex].toString())) ? 0 : result[i][mIndex];
              newData[mIndex] = originalData + curData;
            }
          }
        })
      } else {
        for (let d = 0; d < data.dimensionIndexs.length; d++) {
          rowData.push(result[i][data.dimensionIndexs[d].index]);
        }
        for (let d = 0; d < data.measureIndexs.length; d++) {
          rowData.push(result[i][data.measureIndexs[d].index]);
        }
        newDataArr.push(rowData);

      }
    }
    console.log('newData:', newDataArr);
    for (let m = 0; m < newDataArr.length; m++) {
      let innerPoint = {};
      let outerPoint = {};
      let v = isNaN(newDataArr[m][2]) ? 0 : newDataArr[m][2];
      //内圈数据
      if (m == 0 || newDataArr[m][0] != newDataArr[m - 1][0]) {
        innerPoint = {
          name: newDataArr[m][0],
          y: v
        };
        serieData[0].data.push(innerPoint);

      }
      else {
        serieData[0].data.forEach(sd => {
          if (sd.name = newDataArr[m][0]) {
            sd.y += v
          }
        });
      }
      //外环数据
      outerPoint = {
        name: newDataArr[m][1],
        y: v
      };
      serieData[1].data.push(outerPoint);
    }
    this.options.series = serieData;
    console.log('options:', this.options);
  }
  mixChartData(data: HashMap<String, Number[]>) {
    let seriesDatas = [];
    for (let j = 0, mCount = this.measures.length; j < mCount; j++) {
      seriesDatas.push({
        name: this.measures[j],
        data: []
      });
      if (j == mCount - 1) {
      } else {
        for (let key of data.allKeys()) {
          seriesDatas[j].name = key;
          let rowData = data.get(key);
          for (let i = 0, rowCount = rowData.length; i < rowCount; i++) {
            if (j == mCount - 1) {
              seriesDatas[j].data.push([key, rowData[i]]);
            } else if (j == i) {
              seriesDatas[j].data.push(rowData[i]);
            }
          }
        }
      }
    }
    this.options.series = seriesDatas;
    this.options.xAxis.categories = data.allKeys();
  }

  mockData(): QueryResult {
    let metas = Array<QueryMeta>();
    for (let i = 0; i < 5; i++) {
      let meta = new QueryMeta();
      meta.columnName = "col" + i;
      if (i < 3) {
        meta.columnType = "string";
      } else {
        meta.columnType = "number";
      }
      metas.push(meta);
    }
    let data = new Array<Object[]>();
    for (let j = 0; j < 20; j++) {
      let row = [];
      for (let m = 0; m < 5; m++) {
        if (m < 3) {
          if (j % 2 == 0) {
            row.push("ab" + m);
          } else {
            row.push("cd" + m);
          }

        } else {
          row.push(m);
        }

      }
      data.push(row);
    }
    let result = new QueryResult();
    result.columnMetaList = metas;
    result.results = data;
    return result;
  }
}
