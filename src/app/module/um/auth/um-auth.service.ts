import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {Http} from "@angular/http";
import {CFG} from "../../../common/CFG";
import {Permission} from "../../../common/model/Permission";
const PERMISSION_DATA ={
  "admin" :[
    {"id":"1","name":"创建用户组","code":"user_create_1","isAllowed":true},
    {"id":"2","name":"删除用户组","code":"user_create_2","isAllowed":true},
    {"id":"3","name":"邀请用户","code":"user_create_3","isAllowed":true},
    {"id":"4","name":"模拟权限4","code":"user_create_4","isAllowed":true},
    {"id":"5","name":"模拟权限5","code":"user_create_5","isAllowed":true},
    {"id":"6","name":"模拟权限6","code":"user_create_1","isAllowed":true},
    {"id":"7","name":"模拟权限7","code":"user_create_2","isAllowed":true},
    {"id":"8","name":"模拟权限8","code":"user_create_3","isAllowed":true},
    {"id":"9","name":"模拟权限9","code":"user_create_4","isAllowed":true},
    {"id":"10","name":"模拟权限10","code":"user_create_5","isAllowed":true}
  ],
  "user" : [
    {"id":"11","name":"编辑数据集","code":"user_create_23","isAllowed":true},
    {"id":"12","name":"查看dashboard","code":"user_create_23","isAllowed":true}
  ]
}




@Injectable()
export class UmAuthService {

  constructor(private http : Http) {
  }


  initPermissionList() : Observable<any>{
    //初始化权限列表
    return this.http.get(CFG.API.USER+'/permission')
  }

  updatePermission(role : string,permission : Permission) : Observable<any>{
    role='admin'==role? 'adminRolePermissions':'everyoneRolePermissions';
    let param='/'+Number(permission.isAllowed)+'/'+role+'/'+permission.permissionId+'';
    return  this.http.put(CFG.API.USER+'/permission'+param,{});
  }


}
