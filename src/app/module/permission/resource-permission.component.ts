import {Component, Input, OnInit, Output, OnChanges, SimpleChange, SimpleChanges,ViewEncapsulation} from "@angular/core";
import {ResourcePermission} from "../../common/model/resource-permission.model";
import {ResourcePermissionService} from "../../common/service/resource-permission.service";
import {AppNotification} from "../../app.notification";
import {Error} from "../../common/model/Error";


export class ResourceTypeInfo{
  type : string;
  text : string;
  icon : string;
  constructor(type:string, text:string='', icon:string='') {
    this.type = type;
    this.text = text;
    this.icon = icon;
  }
}


@Component({
  selector:'resource-permission',
  templateUrl:'./resource-permission.component.html',
  styleUrls:['./resource-permission.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ResourcePermissionComponent implements OnChanges {
   @Input() relationResourceID : string;
    @Input() relationResuourceType : string;
    private _resourcePermissionList : ResourcePermission[]=[];
    resourceTypeOption : ResourceTypeInfo[]=[
      new ResourceTypeInfo(ResourcePermission.RESOURCE_TYPE.DATA_SOURCE,'数据源',''),
      new ResourceTypeInfo(ResourcePermission.RESOURCE_TYPE.DATA_SET,'数据集',''),
      new ResourceTypeInfo(ResourcePermission.RESOURCE_TYPE.DASHBOARD,'仪表盘','')
    ];
    resourceType : string=this.resourceTypeOption[0].type;
    PERMISSION_TYPE : any=ResourcePermission.PERMISSION_TYPE;
    RESOURCE_TYPE: any=ResourcePermission.RESOURCE_TYPE;
    constructor(public resourcePermissionService : ResourcePermissionService, public appNotification : AppNotification){

    }

    ngOnChanges(changes: SimpleChanges){
      let simpleChange=changes['relationResourceID'];
      console.log("changes:",changes);
      // if(!simpleChange.isFirstChange()){
      //   console.log("初始化:",this.relationResourceID);
      //   this.initPage();
      // }
      this.initPage();
    }

  get resourcePermissionList():ResourcePermission[]{
    return this._resourcePermissionList;
  }

  set resourcePermissionList(value:ResourcePermission[]){
    console.log("编辑resourcePermissionList:",value);
    this.resourcePermissionService.save(this.relationResourceID,this.relationResuourceType,this.resourceType,value).subscribe((resourcePermissionList : ResourcePermission[])=>{
      console.info("返回结果:",resourcePermissionList);
      this._resourcePermissionList=resourcePermissionList;
      this.appNotification.success("保存成功!");
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });

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
    }

    changeResourceType(resourceType : string){
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
      console.warn("changePermission:",resourcePermission);
      if(resourcePermission.disabled){
        target.checked=!target.checked;
        return;
      }
      let newObj=resourcePermission.clone();
      newObj.permissions=resourcePermission.togglePermission(permission);
      this.resourcePermissionList=this.resourcePermissionList.map((temp : ResourcePermission)=>{
          if(temp.equals(newObj)){
            return  newObj;
          }else{
            return temp
          }
      });
    }

    /**
     * 选中,并且添加全部
     * @param resourcePermissions
     */
    selectAdd(resourcePermissions : ResourcePermission[]){
      let newList=this.resourcePermissionList.concat(resourcePermissions);
      this.resourcePermissionList=newList;
    }

}
