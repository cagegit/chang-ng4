import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {DataSet} from "../model/data-set.model";
import {Observable} from "rxjs/Rx";
import {DomainFactory} from "../DomainFactory";
import {CFG} from "../CFG";
import {AppNotification} from "../../app.notification";

@Injectable()
export class DataSetService {
  // tableList = new Subject<string[]>();
  // selectedTableList = new Subject<string[]>();
  constructor(private http:Http, private appNotification:AppNotification) {

  }

  getById(dataSetId:string):Observable<any> {
    return this.http.get(CFG.API.DATA_SET + `/${dataSetId}`).map((r:Response) => {
      return r.json().DataSet;
    }).catch(this.errHandle);
  }

  /**
   * 保存数据集
   * @param dataSet
   * @returns {any}
   */
  saveOrUpdate(dataSet:DataSet):Observable<any> {
    //return Observable.of(DATA_SET).delay(1000);
    let body = this.buildParam(dataSet);
    //TODO 套接口
    if (!dataSet.dataSetID) {
      return this.http.post(CFG.API.DATA_SET, body).map(this.mapHandle).catch(this.errHandle)
    } else {
      return this.http.put(CFG.API.DATA_SET + `/${dataSet.dataSetID}`, body).map(this.mapHandle).catch(this.errHandle);
    }
  }

  /**
   * 删除数据集
   * @param dataSetId
   * @returns {any}
   */
  delete(dataSetId:string):Observable<any> {
    return this.http.delete(CFG.API.DATA_SET + `/${dataSetId}`).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 验证链接
   * @param dataSet
   */
  validateConnector(dataSet:DataSet):Observable<any> {
    return Observable.of(true).delay(1000);
  }

  /**
   * 获取数据集列表
   * @param dataSet
   * @returns {any}
   */
  find(dataSourceType?:string):Observable<any> {
    let param:string = dataSourceType ? `?datasourcetype=${dataSourceType}` : '';
    return this.http.get(CFG.API.DATA_SET + param).map((response:Response)=> {
      if (response.status != 204)
        return response.json().DataSetBasicList.dataSetBasicList;
      else
        return [];
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  getPreViewDataByTableName(sourceId:string, tableName:string) {
    return this.http.get(CFG.API.DATA_SOURCE + `/id/${sourceId}/${tableName}/preview`).map((r:Response) => {
      return r.json().DataSource.tables[0];
    }).catch(this.errHandle);
    //return Observable.of(DATA_SOURCE.DataSource.tables[0]).delay(1000);
  }

  getPreViewDataBySql(sourceId:string, sql:string) {
    console.log('sql', sql)
    let body = {
      "DataSource": {
        "dataSourceID": sourceId,
        "querySql": sql,
        "type": "DatabaseDataSource"
      }
    }
    return this.http.post(CFG.API.DATA_SOURCE + `/id/${sourceId}/preview`, body).map((r:Response) => {
      return r.json().DataSource.tables[0];
    }).catch(this.errHandle);
    //return Observable.of(DATA_SOURCE.DataSource.tables[0]).delay(1000);
  }

  validateDataSetName(name:string) {
    //let body = {"DataSet":{"dataSetName":name}};
    return this.http.get(CFG.API.DATA_SET + `/namevalidation/${name}`).catch(this.errHandle);
  }

  intercept(observable:Observable<Response>):Observable<Response> {
    return observable.map((response:Response)=> {
      return response.json().DataSet;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  errHandle(r:Response) {
    let errMsg = DomainFactory.buildError(r.json());
    //this.appNotification.error(errMsg.errMsg);
    return Observable.throw(errMsg);
  }

  mapHandle(r:Response) {
    return r.json().DataSet;
  }

  buildParam(obj:any) {
    let json = JSON.stringify(obj);
    return `{"DataSet":${json}}`;
  }

  getSchemaHandle(dataSetID:string):Observable<any> {
    /*    let schemaHandle={
     status : SchemaHandle.STATUS.BUILDING,
     startTime : 1484150400000,
     endTime : 1484841600000,
     remainingTime : (8*60*60+30*60+5)*1000,
     completePercent : 20
     }as SchemaHandle;
     return Observable.of(schemaHandle).delay(1000);*/
    return this.http.get(CFG.API.DATA_SET + `/${dataSetID}/status`).map((response:Response)=> {
      return response.json().SchemaHandle;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  updateSchemaHandle(dataSetID:string):Observable<any> {
    /*    let schemaHandle={
     status : SchemaHandle.STATUS.BUILDING,
     startTime : 1484150400000,
     endTime : 1484841600000,
     remainingTime : (8*60*60+30*60+5)*1000,
     completePercent : 20
     }as SchemaHandle;
     return Observable.of(schemaHandle).delay(1000);*/
    return this.http.get(CFG.API.DATA_SET + `/${dataSetID}/build`).map((response:Response)=> {
      return response.json().SchemaHandle;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  clearSchemaHandle(dataSetID:string):Observable<any> {
    return this.http.get(CFG.API.DATA_SET + `/${dataSetID}/purge`).map((response:Response)=> {
      return response.json().SchemaHandle;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  getDataSetSchedule(dataSetID:string):Observable<any> {
    return this.http.get(CFG.API.DATA_SET + `/${dataSetID}/schedule`).map((response:Response)=> {
      return response.json().SchedulePolicy;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  deleteDataSetSchedule(dataSetID:string):Observable<any> {
    return this.http.delete(CFG.API.DATA_SET + `/${dataSetID}/schedule`).map((response:Response)=> {
      return response.json().SchedulePolicy;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  updateDataSetSchedule(dataSetID:string, cronExpression:string):Observable<any> {
    let body = {
      "SchedulePolicy": {
        "dataSetID": dataSetID,
        "cronExpression": cronExpression
      }
    }
    return this.http.post(CFG.API.DATA_SET + `/${dataSetID}/schedule`, body).map((response:Response)=> {
      return response.json().SchedulePolicy;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  updateCache(dataSetID:string):Observable<any> {
    return this.http.get(CFG.API.DATA_SET + `/${dataSetID}/schema`).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

}
