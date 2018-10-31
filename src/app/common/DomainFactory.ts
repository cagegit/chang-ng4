import {ResponseDTO} from "./dto/ResponseDTO";
import {Error} from "./model/Error";
import {User} from "./model/User";
import {UserDTO} from "./dto/UserDTO";
import {Tenant} from "./model/Tenant";
import {TenantDTO} from "./dto/TenantDTO";
/**
 * 数据模型工厂,根据服务端数据数据模型,转化为前端VO模型
 */
export class DomainFactory{
  static typeArr:string[] = ["Error","User"];

  /**
   * 根据obj内容,返回
   * @param obj
   * @returns {T}
     */
  static build<T>(obj : any) : T{
    console.info("build:",obj);
    let result : T;
    for (var prop in obj) {
      result=obj[prop] as T;
      break;
    }
    console.info("build after:",result);
    return result;
  }

  static buildAny(text : any) : any{
    for(let temp in this.typeArr){
      if(text.hasOwnProperty(temp)){
          return text[temp];
      }
    }
  }

  static buildError(obj : any) : Error{
    // return Error.buildFromResponseDTO(DomainFactory.build<ResponseDTO>(obj));
    return Error.buildFromResponseDTO(obj);

  }

  static buildUser(obj : any) : User{
    return User.buildFromUserDTO(DomainFactory.build<UserDTO>(obj));
  }

  static buildTenant(obj : any) : Tenant{
    return Tenant.buildFromTenantDTO(DomainFactory.build<TenantDTO>(obj));
  }



}
