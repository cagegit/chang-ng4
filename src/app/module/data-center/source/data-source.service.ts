import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient } from "@angular/common/http";
import "rxjs/operators";
import CHANG from "../../../changan/CFG_CHANG";

@Injectable()
export class DataSourceService {
  constructor(private http: HttpClient) {}

  // 获取数据源列表
  getSourceList(): Observable<any> {
    return this.http.get(CHANG.API.DATASOURCE);
  }

  // 新增数据源
  addSourceItem(data): Observable<any> {
    return this.http.post(CHANG.API.DATASOURCE,data);
  }

   // 更新数据源
   updateSourceItem(data): Observable<any> {
    return this.http.put(CHANG.API.DATASOURCE,data);
  }

  // 数据源信息
  getById(id): Observable<any> {
    return this.http.get(CHANG.API.DATASOURCE +  `/id/${id}`);
  }

   //验证数据源名称
   validateDataSourceName(data): Observable<any> {
    return this.http.post(CHANG.API.DATASOURCE + `/validate/${data}`,'');
  }

  //连接测试
  validateConnector(data): Observable<any> {
    return this.http.post(CHANG.API.DATASOURCE + `/testConnection`,data);
  }

    //删除数据源
    deleteDataSourceItem(id): Observable<any> {
      return this.http.delete(CHANG.API.DATASOURCE + `/id/${id}`);
    }

}
