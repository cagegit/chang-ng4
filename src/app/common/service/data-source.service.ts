import {Injectable} from "@angular/core";
import {DataSource} from "../model/data-source.model";
import {Observable} from "rxjs/Rx";
import {Http, Response} from "@angular/http";
import {DomainFactory} from "../DomainFactory";
import {CFG} from "../CFG";
import {Error} from "../model/Error";
import {GitDataSource, Project} from "../model/git-data-source.model";
import {Pagination} from "../model/pagination.model";

const DATA_SOURCE = {
  "dataSourceID": "a1",
  "dataSourceName": "ds_1",
  "dataSourceType": "MySQL",
  "updateType": "Manual",
  "updateFreq": {
    "updateFreqType": "DAILY",
    "interval": 0,
    "time": "12:00:00"
  },
  "databaseName": "codedata",
  "databasePort": "3306",
  "hostname": "192.168.6.145"
}

const DATA_SOURCE_LIST = [
  {
    "dataSourceID": "dsid1",
    "dataSourceName": "ds_name",
    "hostname": "192.168.6.157",
    "databaseName": "regdb",
    "userName": "regadmin",
    "password": "pwd",
    "databasePort": 3306,
    "createdTime": 1477999513000,
    "databaseType": {
      "name": "MySQL",
      "xxxx": "xxx"
    }
  }, {
    "dataSourceID": "dsid2",
    "dataSourceName": "ds_name",
    "hostname": "192.168.6.157",
    "databaseName": "regdb",
    "userName": "regadmin",
    "password": "pwd",
    "databasePort": 3306,
    "databaseType": {
      "name": "MySQL",
      "xxxx": "xxx"
    }
  }, {
    "dataSourceID": "dsid1",
    "dataSourceName": "ds_name",
    "hostname": "192.168.6.157",
    "databaseName": "regdb",
    "userName": "regadmin",
    "password": "pwd",
    "databasePort": 3306,
    "databaseType": {
      "name": "MySQL",
      "xxxx": "xxx"
    }
  }, {
    "dataSourceID": "dsid4",
    "dataSourceName": "ds_name",
    "hostname": "192.168.6.157",
    "databaseName": "regdb",
    "userName": "regadmin",
    "password": "pwd",
    "databasePort": 3306,
    "databaseType": {
      "name": "MySQL",
      "xxxx": "xxx"
    }
  }
]

const ALL_PROJECTS = [
  {
    'projectName': 'project_01'
  },
  {
    'projectName': 'project_02'
  },
  {
    'projectName': 'project_03'
  }
];


@Injectable()
export class DataSourceService {
  constructor(private http:Http) {

  }

  /**
   * 保存数据源
   * @param dataSource
   * @returns {any}
   */
  saveOrUpdate(dataSource:DataSource):Observable<any> {
    console.log("saveOrUpdate", dataSource);
    // return Observable.of(DATA_SOURCE).delay(1000);
    let param = this.buildParam(dataSource);
    if (!dataSource.dataSourceID) {
      return this.intercept(this.http.post(CFG.API.DATA_SOURCE, param));
    } else {
      return this.intercept(this.http.put(CFG.API.DATA_SOURCE, param));
    }
  }

  saveWithDashboard(dataSource:DataSource, dashboardID:string):Observable<any> {
    /*    console.log("saveWithDashboard",dataSource);
     return Observable.of(true).delay(1000);*/
    let param = this.buildParam(dataSource);
    return this.http.post(CFG.API.TEMPLATE + `/switch/${dashboardID}/datasource`, param).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


  /**
   * 获取数据源
   * @param dataSourceId
   * @returns {any}
   */
  getById(dataSourceId:string):Observable<any> {
    return this.intercept(this.http.get(CFG.API.DATA_SOURCE + `/id/${dataSourceId}`));
  }

  /*  findAllProject(dataSource : GitDataSource) : Observable<any>{
   console.log("获取全部peojects列表:",dataSource);
   let param=this.buildParam(dataSource);
   return this.http.post(CFG.API.DATA_SOURCE+'/projects',param).map((r:Response) => {
   let all=r.json().CodeProjects.projects as Project[];
   all=all.map((temp : Project)=>{
   console.log("temp:",temp);
   return Project.build(temp);
   });
   console.log("all:",all);
   return all;
   }).catch((response : Response)=>{
   let errMsg=DomainFactory.buildError(response.json());
   return Observable.throw(errMsg);
   });
   }*/
  findAllProject(dataSource:GitDataSource, page:number, query:string):Observable<any> {

    let param = this.buildParam(dataSource);
    return this.http.post(CFG.API.DATA_SOURCE + `/projects?page=${page}&query=${query}`, param).map((response:Response) => {
      let list:any = response.json().CodeProjects.projects.map((obj:any)=> {
        return Project.build(obj);
      });
      let data = {
        pagination: Pagination.build(response.json().CodeProjects.pagination),
        content: list
      };
      return data;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


  findAllTable(dataSourceId:string):Observable<any> {
    return this.http.get(CFG.API.DATA_SOURCE + `/id/${dataSourceId}/tables`).map((r:Response) => {
      return r.json().DataSource.tables;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


  findAllBranch(dataSource:GitDataSource, projectName:string, page:number, query:string):Observable<any> {
    let param = this.buildParam(dataSource);
    return this.http.post(CFG.API.DATA_SOURCE + `/projects/${projectName}/branches?page=${page}&query=${query}`, param).map((response:Response) => {
      let list:string[] = response.json().CodeProjects.projects[0].branches;
      let data = {
        pagination: Pagination.build(response.json().CodeProjects.pagination),
        content: list
      };
      return data;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 删除数据源
   * @param dataSourceId
   * @returns {any}
   */
  delete(dataSourceId:string):Observable<any> {
    return this.http.delete(CFG.API.DATA_SOURCE + `/id/${dataSourceId}`).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 验证链接
   * @param dataSource
   */
  validateConnector(dataSource:DataSource):Observable<any> {
    let param = this.buildParam(dataSource);
    return this.http.post(CFG.API.DATA_SOURCE + "/testConnection", param)
      // .timeout(5000, new Error(0, "测试连接超时!", ""))
      .catch((response:any)=> {
        if (response.constructor == Error) {
          return Observable.throw(response as Error);
        }
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  /**
   * 验证数据源名称
   * @param stringName
   * @returns {Observable<Response>}
   */
  validateDataSourceName(dataSource:DataSource):Observable<any> {
    let param = this.buildParam(dataSource);
    return this.http.post(CFG.API.DATA_SOURCE + "/validate", param).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 获取数据源列表
   * @param dataSource
   * @returns {any}
   */
  find():Observable<any> {
    return this.http.get(CFG.API.DATA_SOURCE).map((response:Response)=> {
      if (response.status != 204)
        return response.json().DataSourceList.dataSourceList;
      else
        return [];
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 获取Table信息
   * @param dataSourceID  数据源ID
   * @param tableName     tableName
   * @returns {Observable<R>}
   */
  getTableInfo(dataSourceID:string, tableName:string, isSQL:boolean = false):Observable<any> {
    if (isSQL) {
      let param = this.buildParam({dataSourceID: dataSourceID, querySql: tableName});
      return this.http.post(CFG.API.DATA_SOURCE + `/id/${dataSourceID}/columns`, param).map((response:Response)=> {
        return response.json().DataSource.tables[0];
      }).catch((response:Response)=> {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
    } else {
      return this.http.get(CFG.API.DATA_SOURCE + `/id/${dataSourceID}/${tableName}/columns`).map((response:Response)=> {
        return response.json().DataSource.tables[0];
      }).catch((response:Response)=> {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
    }
  }


  /**
   *  预览数据
   */
  findData():Observable<any> {
    return Observable.of(DATA_SOURCE_LIST).delay(1000);
  }


  buildParam(obj:any) {
    let json = JSON.stringify(obj);
    return `{"DataSource":${json}}`;
  }


  intercept(observable:Observable<Response>):Observable<Response> {
    return observable.map((response:Response)=> {
      return response.json().DataSource;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


}
