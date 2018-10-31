import {Observable} from "rxjs/Rx";
import {ResourcePermission, UserPermission} from "../model/resource-permission.model";
import {CFG} from "../CFG";
import {Response, Http} from "@angular/http";
import {DomainFactory} from "../DomainFactory";
import {Injectable} from "@angular/core";

/**
 * 资源权限管理Service
 */
@Injectable()
export class ResourcePermissionService{



  constructor(private http: Http){}

  /**
   * 根据父资源ID,获取其它的资源ID
   * @param relationResourceID
   * @param resourceType
   * @returns {any}
     */
  find(relationResourceID : string,relationResourceType : string,resourceType : string) : Observable<any>{
    let api : string;
    switch (relationResourceType){
      case ResourcePermission.RESOURCE_TYPE.USER : {
        api=`${CFG.API.USER}/resource/${resourceType}`;
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.GROUP : {
        api=`${CFG.API.GROUP}/resource/${relationResourceID}/${resourceType}`;
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SOURCE : {
        api=`${CFG.API.DATA_SOURCE}/id/${relationResourceID}/permission/${resourceType}`;
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SET : {
        api=`${CFG.API.DATA_SET}/${relationResourceID}/permission/${resourceType}`;
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DASHBOARD : {
        api=`${CFG.API.DASHBOARD}/id/${relationResourceID}/permission/${resourceType}`;
        break;
      }
    }
    let isUser=(ResourcePermission.RESOURCE_TYPE.USER==resourceType)||(ResourcePermission.RESOURCE_TYPE.GROUP==resourceType);
    return this.handleRelationResourceList(this.http.get(api),isUser);
  }

  findNotRelation(relationResourceID : string,relationResourceType : string,resourceType : string,resourcePermissionList : ResourcePermission[]) : Observable<any>{
    let api : string,param : string,userPermissionList : UserPermission[]=[];
    switch (relationResourceType){
      case ResourcePermission.RESOURCE_TYPE.USER : {
        api=`${CFG.API.USER}/otherResource/${relationResourceID}/${resourceType}`;
        param=this.buildParamResourcePermissions(resourcePermissionList);
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.GROUP : {
        api=`${CFG.API.USER}/otherResource/${relationResourceID}/${resourceType}`;
        param=this.buildParamResourcePermissions(resourcePermissionList);
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SOURCE : {
        api=`${CFG.API.DATA_SOURCE}/id/${relationResourceID}/otherPermission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SET : {
        api=`${CFG.API.DATA_SET}/${relationResourceID}/otherPermission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DASHBOARD : {
        api=`${CFG.API.DASHBOARD}/id/${relationResourceID}/otherPermission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
    }
    let isUser=(ResourcePermission.RESOURCE_TYPE.USER==resourceType)||(ResourcePermission.RESOURCE_TYPE.GROUP==resourceType);
    return this.handleRelationResourceList(this.http.post(api,param),isUser);
  }


  /**
   * 批量保存资源权限信息
   * @param relationResourceID
   * @param resourceID
   * @param permissions
     */
  save(relationResourceID : string,relationResourceType : string,resourceType : string,resourcePermissionList : ResourcePermission[]=[]): Observable<any>{
    let api : string,param : string;
    switch (relationResourceType){
      case ResourcePermission.RESOURCE_TYPE.USER : {
        api=`${CFG.API.USER}/resource/${relationResourceID}/${resourceType}`;
        param=this.buildParamResourcePermissions(resourcePermissionList);
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.GROUP : {
        api=`${CFG.API.GROUP}/resource/${relationResourceID}/${resourceType}`;
        param=this.buildParamResourcePermissions(resourcePermissionList);
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SOURCE : {
        api=`${CFG.API.DATA_SOURCE}/id/${relationResourceID}/permission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DATA_SET : {
        api=`${CFG.API.DATA_SET}/${relationResourceID}/permission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
      case ResourcePermission.RESOURCE_TYPE.DASHBOARD : {
        api=`${CFG.API.DASHBOARD}/id/${relationResourceID}/permission/${resourceType}`;
        param=this.buildParamUserPermissions(UserPermission.buildListByResourcePermissionList(resourcePermissionList));
        break;
      }
    }
    let isUser=(ResourcePermission.RESOURCE_TYPE.USER==resourceType)||(ResourcePermission.RESOURCE_TYPE.GROUP==resourceType);
    return this.handleRelationResourceList(this.http.post(api,param),isUser);
  }
  /**
   * 修改资源权限关联
   * @param relationResourceID
   * @param resourceID
   * @param permissions
     */
  update(relationResourceID : string,resourceID : string,permissions? : string[]): Observable<any>{
    return Observable.of(true);
  }

  /**
   * 删除资源权限关联
   * @param relationResourceID
   * @param resourceID
     */
  delete(relationResourceID : string,resourceID : string): Observable<any>{
     return Observable.of(true);
    // return this.http.delete(CFG.API.DATA_SOURCE+`/id/${dataSourceId}`).catch((response : Response)=>{
    //   let errMsg=DomainFactory.buildError(response.json());
    //   return Observable.throw(errMsg);
    // });
  }


  handleRelationResourceList(observable: Observable<Response>,isUserPermission:boolean=false): Observable<Response> {
    return observable.map((response : Response)=>{
      console.log("handleRelationResourceList:",isUserPermission,response);
      let list : any[];
      if(!isUserPermission){
        list=response.json().ResourcePermissions.resourcePermissionList as ResourcePermission[];
        console.warn("response.json().ResourcePermissions.resourcePermissionList:",list);
        list=ResourcePermission.buildList(list);
      }else{
        list=response.json().UserPermissions.userPermissionList as UserPermission[];
        console.warn("result:list=",list);
        list=ResourcePermission.buildListByUserPermissionList(list);
        console.warn("build result:list=",list);
      }
      console.log("handleRelationResourceList:",list);
      return list;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  buildParamUserPermissions(obj : any){
    let json=JSON.stringify(obj);
    return `{"UserPermissions":{"userPermissionList": ${json}}}`;
  }

  buildParamResourcePermissions(obj : any){
    let json=JSON.stringify(obj);
    return `{"ResourcePermissions":{"resourcePermissionList": ${json}}}`;
  }





}
