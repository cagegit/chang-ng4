import { Component,ViewChild, Output, EventEmitter } from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";
import {ResourceTypeInfo} from "./resource-permission.component";
import {ResourcePermission} from "../../common/model/resource-permission.model";
import {ResourcePermissionService} from "../../common/service/resource-permission.service";
import {AppNotification} from "../../app.notification";
@Component({
  selector:'resource-permission-modal',
  templateUrl: './resource-permission-modal.component.html',
  styleUrls: ['./resource-permission-modal.component.css']
})
export class ResourcePermissionModalComponent{
  @ViewChild('resourcePermissionModal') resourcePermissionModal:ModalDirective;
  @Output() changeUserPermission = new EventEmitter<any>();
  relationResourceID : string;
  relationResuourceType : string;
  relationResuourceName : string;
  addFlag = false;
  _resourcePermissionList : ResourcePermission[]=[];
  resourceTypeOption : ResourceTypeInfo[]=[
    new ResourceTypeInfo(ResourcePermission.RESOURCE_TYPE.USER,'用户',''),
    new ResourceTypeInfo(ResourcePermission.RESOURCE_TYPE.GROUP,'用户组','')
  ];
  resourceType : string=this.resourceTypeOption[0].type;
  PERMISSION_TYPE : any=ResourcePermission.PERMISSION_TYPE;
  RESOURCE_TYPE: any=ResourcePermission.RESOURCE_TYPE;

  constructor(public resourcePermissionService : ResourcePermissionService, public appNotification : AppNotification){

  }

  get relationResuourceTypeText() : string{
    let text : string;
    switch (this.relationResuourceType){
      case ResourcePermission.RESOURCE_TYPE.DATA_SOURCE :
        text="数据源";
        break;
      case ResourcePermission.RESOURCE_TYPE.DATA_SET :
        text="数据集";
        break;
      case ResourcePermission.RESOURCE_TYPE.DASHBOARD :
        text="Dashboard";
        break;
    }
    return text;
  }

  get resourcePermissionList() : ResourcePermission[]{
    // console.warn("resourcePermissionList:",this._resourcePermissionList);
    return this._resourcePermissionList;
  }
  set resourcePermissionList(resourcePermissions : ResourcePermission[]){
    this._resourcePermissionList=resourcePermissions;
  }

  initPage(){
    console.log("initPage:",this.relationResourceID,this.resourceType);
    this.resourcePermissionService.find(this.relationResourceID,this.relationResuourceType,this.resourceType).subscribe((resourcePermissionList : ResourcePermission[])=>{
      console.info("返回结果:",resourcePermissionList);
      this._resourcePermissionList=resourcePermissionList;
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }

  del(resourcePermission : ResourcePermission){
    if(resourcePermission.disabled){
      return;
    }
    this.resourcePermissionList=this.resourcePermissionList.filter((temp : ResourcePermission)=>{
      return !temp.equals(resourcePermission);
    });
    console.log("del:",this.resourcePermissionList);
  }

  changeResourceType(resourceType : string){
    console.log("changeResourceType:",resourceType);
    this.resourceType=resourceType;
    this.initPage();
  }

  /**
   * 修改权限
   * @param resourcePermission
   * @param permission
   * @param checked
   */
  changePermission(resourcePermission : ResourcePermission,permission : string,target : any){
    if(resourcePermission.disabled){
      target.checked=!target.checked;
      return;
    }
    console.log("old:",resourcePermission.permissions);
    //permission.isAllowed = target.checked;
    let newPermissions=resourcePermission.togglePermission(permission);
    this.resourcePermissionList=this.resourcePermissionList.map((temp : ResourcePermission)=>{
      if(temp.equals(resourcePermission)){
        temp.permissions=newPermissions;
      }
      return temp;
    });
  }

  /**
   * 选中,并且添加全部
   * @param resourcePermissions
   */
  selectAdd(resourcePermissions : ResourcePermission[]){
    this.resourcePermissionList=this._resourcePermissionList.concat(resourcePermissions);
  }

  show(relationResourceID : string,relationResuourceName : string,relationResuourceType : string){
    console.log("show:",relationResourceID,relationResuourceType);
    this.relationResourceID=relationResourceID;
    this.relationResuourceName=relationResuourceName;
    this.relationResuourceType=relationResuourceType;
    this.initPage();
    this.resourcePermissionModal.show();
  }

  cancel(){
    this.resourcePermissionModal.hide();
  }

  save(){
    this.resourcePermissionService.save(this.relationResourceID,this.relationResuourceType,this.resourceType,this.resourcePermissionList).subscribe((resourcePermissionList : ResourcePermission[])=>{
      console.info("返回结果:",resourcePermissionList);
      this._resourcePermissionList=resourcePermissionList;
      this.appNotification.success("保存成功!");
      setTimeout(()=>{
        this.resourcePermissionModal.hide();
      },500);
      this.changeUserPermission.emit(this.relationResourceID);
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }


}
