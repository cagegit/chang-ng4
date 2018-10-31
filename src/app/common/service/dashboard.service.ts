import {Injectable} from "@angular/core";
import {Http, Response,URLSearchParams} from "@angular/http";
import {DataSet} from "../model/data-set.model";
import {Observable} from "rxjs/Rx";
import {DomainFactory} from "../DomainFactory";
import {CFG} from "../CFG";

import {Subject} from "rxjs/Subject";

import {AppNotification} from "../../app.notification";
import {Error} from "../model/Error";
import { DASHBOARD } from '../../module/dashboard/data'
import {Dashboard, SelectParam} from "../model/dashboard.model";


@Injectable()
export class DashboardService{
  dashboardListSubject = new Subject();
  dashboardListSubject$=this.dashboardListSubject.asObservable();
  constructor(private http: Http,private appNotification:AppNotification){

  }
  getDashboards(token?:string){
    let url =CFG.API.DASHBOARD;
    if(token) {
      url +='?token='+token;
    }
    return this.http.get(url).map((res:Response)=> {
      // let list = res.json().ArrayList as Dashboard[];
      let list = res.json().data as Dashboard[];
      list=list.filter(v => v.content!=='string').map((dashboard:any)=>{
        return Dashboard.build(dashboard);
      });
      list.sort((x:Dashboard, y:Dashboard)=> {
        if(y.dashboardName=="Demo"){
          return 1;
        }else{
          return y.content.length-x.content.length;
        }
      });
      return list;
    }).catch((res)=>{
      console.log(res);
      let errMsg=DomainFactory.buildError(res.json());
      return Observable.throw(errMsg);
    })
  }


  getDatasetList(){
    return this.http.get(CFG.API.DATA_SET).map((response : Response)=>{
      return response.json().DataSetBasicList.dataSetBasicList;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  getDashboardLatest(): Observable<any>{
    // return Observable.of("d5120475-487d-490b-b82a-d01553cec852").delay(500);
    return this.http.get(CFG.API.DASHBOARD+'/recently').map((response : Response)=>{
      return response.json().ArrayList?response.json().ArrayList[0]:null;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  getDashboardById(id:string,template:boolean=false){
    return  this.http.get(`${CFG.API.DASHBOARD}/${id}?template=${template}`).map((res:Response)=>{
      let response = res.json();
      return response.data;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      //this.appNotification.error(errMsg.errMsg);
      return Observable.throw(errMsg);
    })
  }
  getAllValueOfFilter({connection,catalog,schema,name,dimension,hierarchy,level,fromTemplateList}){
    return this.http.get(`${CFG.API.OLAP}/${connection}/${catalog}/${schema}/${name}/dimensions/${dimension}/hierarchies/${hierarchy}/levels/${level}?template=${fromTemplateList}
`).map((res:Response)=>{
      return res.json().ArrayList;
      // console.log(res);
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
      //this.appNotification.error(errMsg.errMsg);
    })
  }
  save(dashboard:Dashboard, createFlag:boolean){
    console.log('save',dashboard);
    // let body = {"Dashboard":dashboard};
    let otherParam = {
      "datasetIds": [],
      "cardIds": [],
      "createUserAvatarUrl": "",
      "createUserDisplayName": "",
      "createUserId":0
    };
    let body = Object.assign(otherParam,dashboard);
    otherParam.datasetIds = dashboard.dataSetIDs;
      delete body.templateID;
    if(createFlag){
      return this.http.post(CFG.API.DASHBOARD,body).map((response:Response)=> {
        if(response){
          let res = response.json();
          this.dashboardListSubject.next(true);
          this.appNotification.success('保存成功');
          // return res.DashboardExtended;
          return res.data;
        }

      }).catch((response : Response)=>{
        let errMsg=DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
        //this.appNotification.error(errMsg.errMsg);
      })
    }else {
      return this.http.put(CFG.API.DASHBOARD+'/'+body.dashboardID,body).map((response:Response)=> {
        if(response){
          let res = response.json();
          this.dashboardListSubject.next(true);
          this.appNotification.success('编辑成功');
          // return res.DashboardExtended;
          return res.data;
        }
      }).catch((response : Response)=>{
        let errMsg=DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
        //this.appNotification.error(errMsg.errMsg);
      })
    }

  }
  getCellSet(cardID:string,dataSetID:string,params?:SelectParam[],pageParams?:number[],isTemplate?:boolean):Observable<any>{
    let url=`${CFG.API.OLAP}/query/export/json?cardid=${cardID}&datasetid=${dataSetID}&formatter=flattened`;
    if(isTemplate){
      url+='&template='+isTemplate
    }
    let searchParams=new URLSearchParams();
    if(params) {
      for (let pa of params) {
        if(pa.value.length==0){
          searchParams.set('param'+pa.name, "");
        }else {
          searchParams.set('param' + pa.name, pa.value.join(','));
        }
      }
    }
    if(pageParams&&pageParams.length>0){
      searchParams.set("pageSize", pageParams[0].toString());
      searchParams.set("curPage", pageParams[1].toString());
    }

    return this.http.get(url,{search:searchParams}).map((res:Response)=>{
      return res.json().QueryResult;
    }).catch((res:Response)=>{
      let errMsg=DomainFactory.buildError(res.json());
      return Observable.throw(errMsg);
    })
  }
  catchHandler(response : Response){
    let errMsg=DomainFactory.buildError(response.json());
    this.appNotification.error(errMsg.errMsg);
  }

  /**
   * 删除数据集
   * @param dataSetId
   * @returns {any}
   */
  delete(dashboardID : string) : Observable<any>{
    return this.http.delete(CFG.API.DASHBOARD+`/${dashboardID}`).map((res:Response)=>{
      this.dashboardListSubject.next(true);
      return true;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }
}
