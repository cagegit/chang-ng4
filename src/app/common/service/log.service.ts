/**
 * Created by houxh on 2017-2-20.
 */
import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Observable} from "rxjs/Rx";

import {CFG} from "../CFG";
import {DomainFactory} from "../DomainFactory";
@Injectable()
export class LogService {
  constructor(private http:Http) {

  }

  getExportLog(pageSize:number,curPage:number) {
    let entry = new LogModel();
    let pageHelper=new PageHelper();
    pageHelper.currentPage=curPage;
    pageHelper.pageSize=pageSize;
    entry.pageHelper=pageHelper;
  return this.http.post(CFG.API.LOG + '/report',`{"QueryModel":${JSON.stringify(entry)}}`).map(response =>{
    let rep=response.json();
    return rep.Result;
  }).catch((response: Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  getRecently(curPage:number,pageSize:number) {
    let entry = new LogModel();
    let pageHelper=new PageHelper();
    pageHelper.currentPage=curPage;
    pageHelper.pageSize=pageSize;
    entry.pageHelper=pageHelper;
   return this.http.post(CFG.API.LOG + '/recently',`{"QueryModel":${JSON.stringify(entry)}}`).map(response=> {
      let rep = response.json();
      return rep.Result;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    })
  }
  getDataSetLog(dataSetID:string, curPage:number,itemsPerPage:number) {
    let entry = new LogModel();
    let pageHelper=new PageHelper();
    pageHelper.currentPage=curPage;
    pageHelper.pageSize=itemsPerPage;
    entry.pageHelper=pageHelper;
    return this.http.post(CFG.API.LOG + `/dataset/${dataSetID}`,`{"QueryModel":${JSON.stringify(entry)}}`).map(response=> {
      let rep = response.json();
      return rep.Result;
    }).catch((response:Response)=> {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    })
  }
}
export class LogModel {
  begain:number;
  end:number;
  pageHelper:PageHelper;
}
export class PageHelper {
  currentPage:number;
  pageSize:number;
}
