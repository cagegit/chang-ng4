/**
 * Created by fengjj on 2016/9/19.
 */
import { Injectable } from '@angular/core';
import { Headers ,Http ,Response } from '@angular/http';
//import * as Rx from 'rxjs/Rx'
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import 'rxjs/add/operator/map';

// self model
import { Tenant } from './tenant.model';

//urls
import {CFG} from "../../common/CFG";
import { Error} from '../../common/model/Error'
import { ResponseDTO } from '../../common/dto/ResponseDTO'

import { UserDTO } from '../../common/dto/UserDTO';
import { User } from '../../common/model/User';


@Injectable()
export class RegService {
  errMessage = new BehaviorSubject(null);
  constructor(private http:Http) {
  }

  /**
   * 输入邮箱 设置域名后去创建租户
   * @param email
   * @param domainName
   * @returns {Promise<TResult|T>|Promise<T>|Q.Promise<U>|Observable<R>|Promise<R>|any}
   */
  regAccount(email:string,domainName:string) {
    let body ={
        "tenantName":domainName,
        "email":email
    }
    console.log(CFG.API.TENANT);
    return this.http.post(CFG.API.TENANT,body).map((r:Response) => {
      console.log(r);
      let res = this.responseToJson(r);
      let tenant:Tenant = res;
      // Observable.of(tenant);
      return tenant;
    }).catch(this.handleResponse);
  }
  //设置密码
  setPassword(userName:string,password:string,tenantName:string) {
    let body = {
        "password":password,
        "userName":userName,
        "tenantName":tenantName
    };
    return this.http.post(CFG.API.USER+'/reset/password',body).map((r:Response) => {
      console.warn("登录设置密码:",r.json().data);
      let rawUser = <UserDTO>r.json().data;
      console.log(rawUser);
      let user = User.buildFromUserDTO(rawUser);
      console.log(user);
      return user;
    })
    .catch(this.handleError)
  }
  sendMail(email:string) {
    return this.http.post(CFG.API.USER+'/send/reset/password/email/'+email,null).map((err:Response) => {
      let res:ResponseDTO;
      res = err.json();
      let error = Error.buildFromResponseDTO(res);
      return error;
    }).catch(this.handleError);
  }
  private responseToJson(r:Response) {
    return r.json();
  }
  private handleResponse(err:any){
    console.log(err);
    let res:ResponseDTO;
    res = err.json();
    console.log(res);
    let error = Error.buildFromResponseDTO(res);
    return Observable.of(error);
  }

  private handleError(error: any) {
    console.error('An error occurred', error); // for demo purposes only
    let errMsg = (error.message) ? error.message :error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errMsg);
  }
}
