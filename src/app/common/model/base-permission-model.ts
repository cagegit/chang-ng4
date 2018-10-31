/**
 * 权限模型
 */
export class BasePermissionModel{
    /**授权用户列表**/
    userList : string;
    /**权限列表**/
    permissions : string[]=[];


    constructor(userList:string, permissions:string[]=[]) {
      this.userList = userList;
      this.permissions = permissions?permissions:[];
      // this.permissions = ['add','edit'];
    }

    hasPermission(permission : string) : boolean{
      let check : boolean=this.permissions.findIndex((temp : string)=>{
          return temp==permission;
        })>-1;
      return check;
    }
}
