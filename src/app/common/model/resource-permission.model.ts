export class ResourcePermission{
    resourceID : string;
    resourceName : string;
    resourceType : string;
    permissions : string[]=[];
    disabled : boolean;

    checked : boolean=false;

    static RESOURCE_TYPE={
      USER : 'user',
      GROUP : 'group',
      DATA_SOURCE : 'datasource',
      DATA_SET : 'dataset',
      DASHBOARD : 'dashboards'
    }

      static PERMISSION_TYPE={
        READ : 'get',
        EDIT : 'edit',
        DEL : 'delete',
        AUTH : 'authorize',
        ADD : 'add'
      }

    constructor(resourceID:string, resourceName:string, resourceType:string, permissions:string[]=[],disabled : boolean=false) {
      this.resourceID = resourceID;
      this.resourceName = resourceName;
      this.resourceType = resourceType;
      this.permissions = permissions?permissions:[];
      this.disabled = disabled;
    }

    static build(resourcePermission : ResourcePermission){
      return new ResourcePermission(resourcePermission.resourceID,resourcePermission.resourceName,resourcePermission.resourceType,resourcePermission.permissions,resourcePermission.disabled);
    }

    static buildList(resourcePermissionList : ResourcePermission[]=[]) : ResourcePermission[]{
      let arr : ResourcePermission[]=[];
      if(resourcePermissionList){
        resourcePermissionList.forEach((resourcePermission : ResourcePermission)=>{
          arr.push(ResourcePermission.build(resourcePermission));
        });
      }
      return arr;
    }

    static buildByUserPermission(userPermission : UserPermission){
      return new ResourcePermission(userPermission.userName,userPermission.displayName,userPermission.type,userPermission.permissions,userPermission.disabled);
    }

    static buildListByUserPermissionList(userPermissionList : UserPermission[]=[]) : ResourcePermission[]{
      let resourcePermissionList : ResourcePermission[]=[];
      if(userPermissionList){
        userPermissionList.forEach((userPermission : UserPermission)=>{
          resourcePermissionList.push(ResourcePermission.buildByUserPermission(userPermission));
        });
      }
      return resourcePermissionList;
    }

    clone() : ResourcePermission{
      return ResourcePermission.build(this);
    }

    toUserPermission() : UserPermission{
      return new UserPermission(this.resourceID,this.resourceName,this.resourceType,this.permissions,this.disabled);
    }


    equals(resourcePermission : ResourcePermission) : boolean{
      return (this.resourceID==resourcePermission.resourceID)&&(this.resourceType==resourcePermission.resourceType);
    }

    hasPermission(permission : string) : boolean{
      let check : boolean=this.permissions.findIndex((temp : string)=>{
            return temp==permission;
        })>-1;
      return check;
    }

    togglePermission(permission : string) : string[]{
      //复制数组
      let arr:string[]=[];
      this.permissions.forEach((temp : string)=>{
        arr.push(temp);
      });

      if(this.hasPermission(permission)){
        arr=this.permissions.filter((temp : string)=>{
            return temp!=permission;
        })
      }else{
        arr.push(permission);
      }
      return arr;

    }

}


export class UserPermission{
  userName : string;
  displayName : string;
  type : string;
  permissions : string[]=[];
  disabled : boolean;
  constructor(userName:string, displayName:string, type:string, permissions:string[]=[],disabled : boolean=false) {

      this.userName = userName;
      this.displayName = displayName;
      this.type = type;
      this.permissions = permissions?permissions:[];
      this.disabled=disabled;
  }

  static buildListByResourcePermissionList(resourcePermissionList : ResourcePermission[]) : UserPermission[]{
    let userPermissionList : UserPermission[]=[];
    if(resourcePermissionList){
      resourcePermissionList.forEach((resourcePermission : ResourcePermission)=>{
        userPermissionList.push(resourcePermission.toUserPermission());
      });
    }
    return userPermissionList;
  }
}
