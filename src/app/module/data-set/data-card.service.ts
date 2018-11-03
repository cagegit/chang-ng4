import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient } from "@angular/common/http";
import "rxjs/operators";
import {CHANG} from '../../changan/CFG_CHANG';

@Injectable()
export class DataCardService {
  constructor(private http: HttpClient) {}
  // 获取数据集下报表
  getCardList(id,pageSize,type): Observable<any> {
    return this.http.get(CHANG.API.CARD + `/dataSetId/${id}?datasourcetype=${type}`);
  }

  // // 新增数据集
  //  saveSetItem(data): Observable<any> {
  //   return this.http.post(CHANG.API.CARD, data);
  // }

  // // 更新数据集
  // updateSetItem(data): Observable<any> {
  //   return this.http.put(CHANG.API.CARD, data);
  // }

  //获取数据集下报表
  getCards(id,pageNum,pageSize): Observable<any> {
    return this.http.get(CHANG.API.CARD + `/dataSetId/${id}?pageNum=${pageNum}&pageSize=${pageSize}`);
  }

  //获取数据集信息
  getById(id): Observable<any> {
    return this.http.get(CHANG.API.DATASET + `/${id}`);
  }

  //删除数据集下报表
  delete(id): Observable<any> {
    return this.http.delete(CHANG.API.CARD + `/dataSetId/${id}`);
  }

  //删除指定报表
  delCard(id): Observable<any> {
    return this.http.delete(CHANG.API.CARD + `/${id}`);
  }
 
  //报表获取指标 维度
  getTableInfo(dataSourceID, tableName, isSQL:boolean = false):Observable<any> {
    // if (isSQL) {
    //   let param = this.buildParam({dataSourceID: dataSourceID, querySql: tableName});
    //   return this.http.post(CFG.API.DATA_SOURCE + `/id/${dataSourceID}/columns`, param).map((response:Response)=> {
    //     return response.json().DataSource.tables[0];
    //   }).catch((response:Response)=> {
    //     let errMsg = DomainFactory.buildError(response.json());
    //     return Observable.throw(errMsg);
    //   });
    // } else {
      return this.http.get(CHANG.API.DATASOURCE + `/id/${dataSourceID}/${tableName}/columns`);
    // }
  }
}
