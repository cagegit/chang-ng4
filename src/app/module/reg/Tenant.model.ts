/**
 * Created by fengjj on 2016/9/22.
 */
export interface Tenant {
  active:boolean;
  email:string;
  // tenantID:string;
  name:string;
  id:string;
  domain?:string;
  updateTime?:number;
  // userConfig?:any;
  // numOfGroups?:number;
  // numOfUsers?:number;
  // numOfDataSources?:number;
  // numOfDataboards?:number;
}


