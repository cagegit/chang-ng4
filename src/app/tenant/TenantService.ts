import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {Http} from "@angular/http";
import ".././rxjs-extensions";
import {CFG} from "../common/CFG";

@Injectable()
export class TenantService {

  constructor(private http : Http){

  }

  initTenantInfo() : Observable<any>{
    //初始化权限列表
    console.info("初始化租户信息:");
    return this.http.get(CFG.API.TENANT);
  }

  // updateTenant(domainPrefix : string) : Observable<any>{
  //   // return this.http.put(CFG.API.TENANT,domainPrefix);
  //   console.info("更新域名前缀:",domainPrefix);
  //   return Observable.of(true).delay(1000).do(()=>{});
  // }


}
