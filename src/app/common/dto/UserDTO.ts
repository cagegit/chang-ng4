/**
 * 服务端用户视图模型
 * data transfer object
 */
export class UserDTO{
  id : number;
  name : string;
  password : string;
  // saltValue : string;
  // requireChange : boolean;
  // changedTimestamp : string;
  tenantId : number;
  // displayName : string;
  domainName : string;
  admin : boolean;
  // userAvatar : string;
  permission : string[];
}
