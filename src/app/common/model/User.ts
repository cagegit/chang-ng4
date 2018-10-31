import {UserDTO} from "../dto/UserDTO";
/**
 * VO  用户视图模型
 */
export  class User{
  id : number;
  userId: any;
  userName: string;
  name : string;
  userDisplayName : string;
  userHeadImg: string;
  password:string;
  domainName : string;
  admin : boolean;
  tenantId : number;
  permission : string[]=[];
  constructor(id?:number, name:string="", domainName:string="", password:string="", admin:boolean=false,tenantId? : number, permission:string[]=[]) {
      this.id = id;
      this.name = name;
      // this.userDisplayName = userDisplayName;
      // this.userHeadImg = userHeadImg;
      this.domainName = domainName;
      this.admin = admin;
      this.password = password;
      this.tenantId = tenantId;
      if(permission){
        permission.forEach((temp : string)=>{
          this.permission.push(temp);
        });
      }
  }

    static buildFromUserDTO(userDTO : UserDTO){
      return new User(userDTO.id,userDTO.name,userDTO.domainName,userDTO.password,userDTO.admin,userDTO.tenantId);
    }

  hasPermission(permission : string) : boolean{
      return this.permission.findIndex((temp : string)=>{
        return temp==permission;
      })>-1;
  }

}
