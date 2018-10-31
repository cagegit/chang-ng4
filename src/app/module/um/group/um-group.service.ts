import {Injectable} from "@angular/core";
import {Group} from "./group.model";
import {Observable} from "rxjs/Rx";
import "rxjs/operator/filter";
import "rxjs/observable/of";
import {Http} from "@angular/http";
import {CFG} from "../../../common/CFG";


const DATA_SET_LIST = [
  {"dataSetId":'1',"dataSetName":"数据集1"},
  {"dataSetId":'2',"dataSetName":"数据集2"},
  {"dataSetId":'3',"dataSetName":"数据集3"},
  {"dataSetId":'4',"dataSetName":"数据集4"}
]

const DATA_SET_LIST_ALL = [
  {"dataSetId":'1',"dataSetName":"数据集1"},
  {"dataSetId":'2',"dataSetName":"数据集2"},
  {"dataSetId":'3',"dataSetName":"数据集3"},
  {"dataSetId":'4',"dataSetName":"数据集4"},
  {"dataSetId":'6',"dataSetName":"数据集5"},
  {"dataSetId":'7',"dataSetName":"数据集6"},
  {"dataSetId":'8',"dataSetName":"数据集7"},
  {"dataSetId":'9',"dataSetName":"数据集8"},
  {"dataSetId":'10',"dataSetName":"数据集9"},
  {"dataSetId":'11',"dataSetName":"数据集10"},
  {"dataSetId":'12',"dataSetName":"数据集11"},
  {"dataSetId":'12',"dataSetName":"数据集12"}
]





@Injectable()
export class UmGroupService {

    constructor(private http : Http){

    }
    /**
     * 初始化用户组列表
     */
    initGroupList() : Observable<any>{
      return this.http.get(CFG.API.GROUP);
    }

  /**
   * 根据关键词过滤
   * @param keyword
   */
    filterGroupList(keyword : string){

    }

    /**
     * 根据groupId获取分组信息 包含用户组列表和数据集列表
     * @param groupId
     */
    getGroup(groupId : number) : Observable<any> {
      let param='/id/'+groupId;
      return this.http.get(CFG.API.GROUP+param);
    }

    getDataSetList(): Observable<any> {
      return Observable.of(DATA_SET_LIST).delay(1000);
    }


    /**
     * 修改分组信息
     * @param group
     */
    updateGroup(groupId : number,groupName) : Observable<any>{
      console.log("修改用户分组",groupId,groupName);
      //TODO 修改用户分组名称
      let param={
        "Group":{
          "groupID": groupId,
          "groupName": groupName
        }
      }
      return this.http.put(CFG.API.GROUP,JSON.stringify(param));
    }

    /**
     * 删除分组
     * @param groupId
     */
    deleteGroup(groupId : number) : Observable<any>{
      console.info("删除用户分组:",groupId);
      let param='/'+groupId;
      return this.http.delete(CFG.API.GROUP+param);
    }

    /**
     * 保存分组
     * @param groupName
     * @returns {any}
     */
    saveGroup(groupName : string) : Observable<any>{
      let param={
        "Group":{
          "groupName": groupName
        }
      }
      return this.http.post(CFG.API.GROUP,JSON.stringify(param));
    }


    /**
     * @param gouupId
     */
    findUserAll() : Observable<any>{
      return this.http.get(CFG.API.TENANT+'/users');
    }

    /**
     * 删除某个分组下的用户
     * @param groupId
     * @param userId
     */
    deleteUser(groupId : number,userId : number) : Observable<any>{
      var url='/'+groupId+'/user/'+userId;
      return this.http.delete(CFG.API.GROUP+url);
    }

    /**
     * 给某个分组下添加用户
     * @param groupId
     * @param userId
     */
    addUser(groupId : number,userId : number) : Observable<any>{
      let param={
        "Group":{
          "groupID": groupId
        }
      }
      var url=CFG.API.GROUP+'/user/'+userId;

      return this.http.post(url,JSON.stringify(param));
    }

    /**
     *
     * @param gouupId
     */
    deleteDataSet(gouupId : number,dataSetId : number) : Observable<any>{
      return Observable.of(true).delay(1000);
    }

    /**
     * 查询全部数据集列表
     * @param gouupId
     */
    findDataSetAll() : Observable<any>{
      return Observable.of(DATA_SET_LIST_ALL).delay(1000);
    }

  /**
   * 给某个分组下添加数据集
   * @param groupId
   * @param dataSetId
     */
    addDataSet(groupId : number,dataSetId : number) : Observable<any>{
      return Observable.of(true).delay(1000);
    }


}
