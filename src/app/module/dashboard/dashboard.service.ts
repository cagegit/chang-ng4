import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import "rxjs/operators";
import {CHANG} from '../../changan/CFG_CHANG';
@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}
  // 获取仪表盘列表
  getDashboards(): Observable<any> {
    return this.http.get(CHANG.API.DASHBOARD);
    // return this.http.get(CHANG.API.DATASOURCE);
  }

  //新增仪表盘
   saveSetItem(data): Observable<any> {
    return this.http.post(CHANG.API.DASHBOARD, data);
  }

  // 更新仪表盘
  updateSetItem(data): Observable<any> {
    return this.http.put(CHANG.API.DASHBOARD, data);
  }

  //获取数据源下仪表盘
  findAllTable(id): Observable<any> {
    return this.http.get(CHANG.API.DATASOURCE + `/id/${id}/tables`);
  }

  //获取仪表盘信息
  getById(id): Observable<any> {
    return this.http.get(CHANG.API.DASHBOARD + `/${id}`);
  }

  //验证仪表盘名称
  validateDataName(data): Observable<any> {
    return this.http.get(CHANG.API.DASHBOARD + `/namevalidation/${data}`);
  }

 
  //删除仪表盘
  deleteSetItem(id): Observable<any> {
    return this.http.delete(CHANG.API.DASHBOARD + `/${id}`);
  }
}
