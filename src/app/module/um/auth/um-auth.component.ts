import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import "rxjs/add/operator/map";
import {UmAuthService} from "./um-auth.service";
import {Response} from "@angular/http";
import {Permission} from "../../../common/model/Permission";
import {AppNotification} from "../../../app.notification";
import {DomainFactory} from "../../../common/DomainFactory";

interface PermissionDTO{
  permissionId : number,
  resourceId : string,
  allow : boolean
}

@Component({
  templateUrl : './um-auth.component.html',
  styleUrls:['./um-auth.component.css'],
  providers:  [ UmAuthService ]
})
export class UmAuthComponent implements OnInit{

  /**
   * 管理员权限列表
   */
  public adminPermissions : any[]=[];
  /**
   * 普通用户权限列表
   */
  public userPermissions : any[]=[];

  /**
   * 正在提交 防止快速重复提交引起的数据错误
   */
  public submitted=false;

  public timer : number;

  constructor(private route: ActivatedRoute,private umAuthService : UmAuthService,private appNotification : AppNotification) {
    console.info("UmAuthComponent");
  }

  /**
   * 初始化组件数据
   */
  ngOnInit():void {
    this.umAuthService.initPermissionList().toPromise().then((response : Response)=>{
      let data=response.json().Users;
      let k:any,subArr:Permission[],arr:any[];
      for(k in data.adminRolePermissions){
        arr=[];
        subArr=data.adminRolePermissions[k];
        if(subArr){
          subArr.forEach((v : any)=>{
            arr.push(new Permission(v.permissionId,v.permissionName,v.permissionCode,v.allow));
          })
          this.adminPermissions.push(arr);
        }
      }
      for(k in data.everyoneRolePermissions){
        arr=[];
        subArr=data.everyoneRolePermissions[k];
        if(subArr){
          subArr.forEach((v : any)=>{
            arr.push(new Permission(v.permissionId,v.permissionName,v.permissionCode,v.allow));
          })
          this.userPermissions.push(arr);
        }
      }
      console.info("this.adminPermissions",this.adminPermissions);

      //TODO 对象属性遍历,无法做到有序遍历
    }).catch((error : Response)=>{
        console.error("初始化权限列表异常",error);
    })


  }

  change(target,permission,role) {
    target.checked=true;
/*    console.info("当前选中状态:",target.checked);
    permission.isAllowed = target.checked;
    this.submitted=true;
    this.umAuthService.updatePermission(role,permission).toPromise().then((response : any)=>{

    }).catch((response : any)=>{
      let message=DomainFactory.buildError(response.json()).errMsg;
      this.appNotification.error(message);

      target.checked=!target.checked;
    })
    this.submitted=false;*/
  }

}
