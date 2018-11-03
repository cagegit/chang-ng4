import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { Http } from "@angular/http";
import {CHANG} from "../CFG_CHANG";
import { Permission } from "../../../common/model/Permission";
@Injectable()
export class ProtocolService {
  constructor(private http: Http) {}

  // 获取协议列表
  getProtocolList(): Observable<any> {
    return this.http.get(CHANG.API.PROTOCOL + "/list");
  }
 
  //根据协议名称获取
  getProtocolListByName(parmas:string): Observable<any> {
    return this.http.post(CHANG.API.PROTOCOL + "/searchByName?name="+parmas,null);
  }

  //新增协议
  addProtocolAPi(data): Observable<any> {
    let body = {
      name: data.name,
      ruleNo: data.ruleNo,
      type: data.type,
      port: data.port,
      notes: data.notes
    };
    return this.http.post(CHANG.API.PROTOCOL + "/add", body);
  }

  //更新协议
  updateProtocolAPi(data): Observable<any> {
    let body = {
      id:data.id,
      name: data.name,
      ruleNo: data.ruleNo,
      type: data.type,
      port: data.port,
      notes: data.notes
    };
    return this.http.post(CHANG.API.PROTOCOL + "/update", body);
  }
  
  //删除协议
  deleteProtocolApi(id:string) {
    return this.http.delete(CHANG.API.PROTOCOL+"/"+id);
  }

  //获取数据项列表
  getSearchDataList(parmas:string) {
    this.http
      .get(CHANG.API.TENANT + "/users" + parmas);
  }

  //根据数据项名称获取
  getDataListByName(protocolId:string,itemName:string): Observable<any> {
    return this.http.get(CHANG.API.DATAITEM + "/getAssignedItemsByProtocolId?protocolId="+protocolId+"&itemName="+itemName);
  }


  //新增数据项时 所有数据项
  getDataAllList(protocolId:string): Observable<any> {
    return this.http.get(CHANG.API.DATAITEM + "/getDataItemByProtocoId?protocolId="+protocolId);
  } 

  //保存数据项
  saveDataItem(data): Observable<any> {
    return this.http.post(CHANG.API.PROTOCOL + "/addDataItem",data);
  }

  //删除协议
  deleteDataItemApi(data:any) {
    return this.http.post(CHANG.API.PROTOCOL+"/removeDataItem",data);
  }


  private handleError(error: any) {
    let errMsg = error.json().errorMessage;
    return Observable.throw(errMsg);
  }
}
