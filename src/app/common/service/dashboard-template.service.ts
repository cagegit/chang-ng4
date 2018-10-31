import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {AppNotification} from "../../app.notification";
import {Http, Response} from "@angular/http";
import {CFG} from "../CFG";
import {DomainFactory} from "../DomainFactory";
import {DashboardTemplate} from "../model/dashboard-template.model";


const DASHBOARD_TEMPLATE_LIST = [
  {
    templateID : "a1",
    templateName : "模版1",
    dataSourceType : "isource",
    dashboardID : "c4022b96-4f40-4022-b6fe-a0253d166cf4"
  },
  {
    templateID : "a2",
    templateName : "模版2",
    dataSourceType : "isource",
    dashboardID : "697fe73a-ddf4-448d-a421-dd7d08890074"
  }
]


@Injectable()
export class DashboardTemplateService{

  constructor(private http: Http){}

  createDashboard(templateID : string): Observable<any>{
    return this.http.get(CFG.API.TEMPLATE+`/apply/${templateID}`).map((response : Response)=>{
      return response.json().ArrayList[0];
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 获取dashboard模版列表
   * @param manifest
   * @returns {any}
   */
  find() : Observable<any>{
   return this.http.get(CFG.API.TEMPLATE).map((response : Response)=>{
      let list:any=response.json().TemplateList.templates.map((obj : any)=>{
        return DashboardTemplate.build(obj);
      });
      return list;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 获取dashboard的
   * @param manifest
   * @returns 复制template的新dashboard
   */
  getById(templateID : string) : Observable<any>{
    return this.http.get(CFG.API.TEMPLATE+`/${templateID}`).map((response:Response) => {
      return response.json().TemplateList.templates[0];
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 替换dashboard的数据集
   * @param dashboardID
   * @param dataSetID
     */
  updateDataByDataSet(dashboardID : string,dataSetID : string): Observable<any>{
    return this.http.get(CFG.API.TEMPLATE+`/switch/${dashboardID}/dataset/${dataSetID}`).catch(this.errHandle);
  }

  /**
   * 替换dashboard的数据源
   * @param dashboardID
   * @param dataSetID
   */
  updateDataByDataSource(dashboardID : string,dataSourceID : string): Observable<any>{
    return this.http.get(CFG.API.TEMPLATE+`/switch/${dashboardID}/datasource/${dataSourceID}`).catch(this.errHandle);
  }

  errHandle(response:Response) {
    let errMsg=DomainFactory.buildError(response.json());
    return Observable.throw(errMsg);
  }

}
