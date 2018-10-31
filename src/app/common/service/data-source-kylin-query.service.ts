import {Injectable} from "@angular/core";
import {DataSource} from "../model/data-source.model";
import {Observable} from "rxjs/Rx";
import {Http, Response} from "@angular/http";
import {DomainFactory} from "../DomainFactory";
import {CFG} from "../CFG";
import {Error} from "../model/Error";
import {Query} from "../model/query-model";


const SAVED_QUERY = {
  "queryID" : "111",
  "createdTime" : 1484711446399,
  "updatedTime" : 1484711446399,
  "sql" : "select * from x"
}

const HISTORY_QUERY_LIST = [
  {
    "queryID" : "1",
    "createdTime" : 1484711446399,
    "updatedTime" : 1484711446399,
    "sql" : "select * from y"
  },
  {
    "queryID" : "2",
    "createdTime" : 1484711446399,
    "updatedTime" : 1484711446399,
    "sql" : "select * from z"
  },
  {
    "queryID" : "3",
    "createdTime" : 1484711446399,
    "updatedTime" : 1484711446399,
    "sql" : "select * from y"
  },
  {
    "queryID" : "4",
    "createdTime" : 1484711446399,
    "updatedTime" : 1484711446399,
    "sql" : "select * from y"
  }
]

@Injectable()
export class DataSourceKylinQueryService{
  constructor(private http: Http){}

  /**
   * 查询SQL
   * @param sql
     */
  executeQuery(dataSetID : string,query : Query): Observable<any>{
    let json=JSON.stringify(query);
    let param:string=`{"SQLRequest":${json}}`;
    return this.http.post(CFG.API.DATA_SET+`/${dataSetID}/kylin/query`,param).map((r:Response) => {
      return r.json().DataSourceTable;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  export(dataSetID : string,query : Query): string{
    return CFG.API.DATA_SET+`/${dataSetID}/kylin/exportcvs?sql=${query.sql}`;
  }

  saveOrUpdateQuery(dataSetID : string,query : Query): Observable<any>{

    if(query.id){
      //编辑SQL
      console.log("saveOrUpdateSQL:编辑SQL",query);
      return Observable.of(SAVED_QUERY);
    }else{
      let json=JSON.stringify(query);
      let param:string=`{"SaveSqlRequest":${json}}`;
      return this.http.post(CFG.API.DATA_SET+`/${dataSetID}/kylin/savedqueries`,param).map((r:Response) => {
        return r.json().SaveSqlRequest;
      }).catch((response : Response)=>{
        let errMsg=DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
    }
  }

  findSavedQuery(dataSetID : string): Observable<any>{
    return this.http.get(CFG.API.DATA_SET+`/${dataSetID}/kylin/savedqueries`).map((r:Response) => {
      return r.json().ArrayList;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  deleteQuery(dataSetID : string,query : Query): Observable<any>{
    return Observable.of(true);
  }

  findHistoryQuery(dataSetID : string): Observable<any>{
    return Observable.of(HISTORY_QUERY_LIST);
  }


  findAllTable(dataSetID : string) : Observable<any>{
    return this.http.get(CFG.API.DATA_SET+`/${dataSetID}/kylin/tablesandcolumns`).map((r:Response) => {
      return r.json().ArrayList;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.map((response : Response)=>{
      return response.json().DataSource;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }



}
