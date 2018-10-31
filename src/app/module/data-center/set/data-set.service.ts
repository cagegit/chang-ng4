import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient } from "@angular/common/http";
import "rxjs/operators";
import CHANG from "../../../changan/CFG_CHANG";
import { DataSource } from '../../../common/model/data-source.model';

@Injectable()
export class DataSetService {
  constructor(private http: HttpClient) {}
  // 获取数据集列表
  getSetList(type,id,token?:string): Observable<any> {
    let url ='';
    if(token) {
       url = CHANG.API.DATASET + `?datasourcetype=${type}&datasourceid=${id}&token=${token}`
    } else {
       url = CHANG.API.DATASET + `?datasourcetype=${type}&datasourceid=${id}`;
    }
    return this.http.get(url);
    // return this.http.get(CHANG.API.DATASOURCE);
  }

  // 新增数据集
   saveSetItem(data): Observable<any> {
    return this.http.post(CHANG.API.DATASET, data);
  }

  // 更新数据集
  updateSetItem(data): Observable<any> {
    return this.http.put(CHANG.API.DATASET,data);
  }

  //获取数据源下数据集
  findAllTable(id): Observable<any> {
    return this.http.get(CHANG.API.DATASOURCE + `/id/${id}/tables`);
  }

  //获取数据集信息
  getById(id): Observable<any> {
    return this.http.get(CHANG.API.DATASET + `/${id}`);
  }

  //验证数据集名称
  validateDataName(data): Observable<any> {
    return this.http.get(CHANG.API.DATASET + `/namevalidation/${data}`);
  }

 
  //删除数据集
  deleteSetItem(id): Observable<any> {
    return this.http.delete(CHANG.API.DATASET + `/${id}`);
  }
}
