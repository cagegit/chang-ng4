export class Permission{
  public permissionId : number;
  public permissionName : string;
  public code : string;
  public isAllowed : boolean;
  constructor(permissionId : number,permissionName : string,code : string, allow : boolean){
    console.log("构造参数:",permissionId,permissionName,allow);
    this.permissionId=permissionId;
    this.permissionName=permissionName;
    this.code='';
    this.isAllowed=allow;
    console.log("构造后",this.isAllowed);
  }

}
