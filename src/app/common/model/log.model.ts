/**
 * Created by houxh on 2017-2-20.
 */
export class Log{
  action:string;
  logId:number;
  resourceExists:boolean;
  resourceId:string;
  resourceName:string;
  resourceReferExists:boolean;
  resourceReferId:string;
  resourceReferName:string;
  resourceType:string;
  tenantId:number;
  updateTime:number;
  userId:string;
  userName:string;
}
export enum ActionType {
  CREATE, EDIT, VIEW, REMOVE, INVITE, AUTHORIZE, UNAUTHORIZE,JOIN,BUILD,AUTOBUILD,GROUPAUTHORIZE,GROUPUNAUTHORIZE,
  ADD_USER,//表示组中添加用户
  REMOVE_USER, //表示组中删除用户
  BE_ADMIN//表示成为组管理员
}
export enum ResourceType {
  DATASET, DATASOURCE, CARD, DASHBOARDS, USER, GROUP, MODEL,TENANT
}

