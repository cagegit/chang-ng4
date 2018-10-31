/**
 * Created by fengjj on 2016/9/29.
 */
import { Injectable } from '@angular/core';
import { Http ,Response ,Headers } from '@angular/http';

import  'rxjs/add/operator/map';

import * as url from './url.config';
import { Observable } from  'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/operator/filter';
import 'rxjs/observable/of';

import { BaseUser, User ,UserClass ,BaseUserClass } from './user.model';
import {CFG} from "../../../common/CFG";
import { AppNotification } from '../../../app.notification';
import {Subject} from "rxjs/Subject";
import {AppContext} from "../../../common/AppContext";
import {DomainFactory} from "../../../common/DomainFactory";

@Injectable()
export class UmUserService {
  userListSubject = new BehaviorSubject(null);
  userDetailSubject  = new BehaviorSubject(null);
  domainName = new BehaviorSubject(null);
  tenantID:string;
  editSuccess = new Subject();
  inviteSuccess = new Subject();
  constructor(private http:Http,private appNotification:AppNotification,private appContext:AppContext) {}

  /***
   * 邀请用户
   * @param user
   * @returns {any}
   */
  addUser(user:{[key:string]:any}) {
    user['userName'] = user['userName'];
    let body = {
      "User":{
        "userName" : user["userName"],
        "groupName":user["groupName"],
        "isAdmin":Boolean(user["isAdmin"]),
        "displayName":user["displayName"]
      }
    }
    return this.http.post(CFG.API.USER,JSON.stringify(body)).map(this.mapFunction).catch(this.handleError).subscribe((u:any) => {
      let userList = this.userListSubject.getValue();
      userList.push(new BaseUserClass(u.User));
      this.userListSubject.next(userList);
      this.appNotification.success('邀请用户成功!');
      this.inviteSuccess.next(true);
    },(err:string)=>{
      this.appNotification.error(err);
      console.log(err);
    })
  }
  /**
   * 删除用户
   * @param id 用户id
   */
  deleteUser(id:string,email:string) {
    this.http.delete(CFG.API.USER+'/'+email).map(this.mapFunction).catch(this.handleError).subscribe((d:any) => {
      console.log(d);
      if(d.HttpResponseState.code === 200) {
        let user_list = this.userListSubject.getValue();
        let userList = [];
        for(let u of user_list) {
          if(u.id !== id) {
            userList.push(u);
          }
        }
        this.userListSubject.next(userList);
        this.appNotification.success('用户删除成功!');
      }
    })

  }
  /**
   * 修改用户信息
   * @param d
   * @returns {any}
   */
  editUser(obj:{[key:string]:any},userName:string) {
    console.log('obj service',obj);
    let body = {"User":{}};
    body.User['userName'] = userName;
    for(let key in obj){
      body.User[key] = obj[key];
    }
   console.log('body',body);
    this.http.put(CFG.API.USER,JSON.stringify(body)).map(this.mapFunction).catch(this.handleError)
      .subscribe((d:{[key:string]:any}) => {
        let userList = [];
        this.userDetailSubject.next(new UserClass(d['User']));
        this.userListSubject.getValue().forEach((user:BaseUserClass) => {
          if(user.id == d['User']['userID']) {
            userList.push(new BaseUserClass(d['User']));
          }else {
            userList.push(user);
          }
        })
        this.userListSubject.next(userList);
        this.editSuccess.next();
        this.appNotification.success('编辑成功');
      },(err:string)=>{
        this.appNotification.error(err);
      })
  }

  updatePwd(userName:string,pwd : string,oldPwd : string) : Observable<any>{
    let body = {
      "User": {
        "userName":userName,
        "userPassword":pwd,
        "userOldPassword":oldPwd
      }
  }
    return this.http.put(CFG.API.USER+'/changePwd',JSON.stringify(body)).map((response : Response)=>{

    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }



  /**
   * 获取用户列表
   */
  getUsersList() {
    this.http.get(CFG.API.TENANT+'/users').map((r:Response) => {
      return r.json();
    }).subscribe((d:any) => {
      console.log(d);
      this.tenantID = d.Users.tenantID;
      let userList = [];
      //for(let user of d.Users.userList) {
      //  if(user.userID != 0) {
      //    userList.push(new BaseUserClass(user));
      //  }
      //}


      let users = d.Users.userList;
      //for(let user of ) {
      //  userList.push(new BaseUserClass(user));
      //}
      let len = users.length;
      for (let i = 0;i< len;i++){
        if(users[i].userID == this.appContext.user.userId){
          //let u = users.splice(i,1);
          userList.unshift(new BaseUserClass(users[i]));
        }else {
          userList.push(new BaseUserClass(users[i]));
        }
      }
      console.log('user list',userList);
      this.userListSubject.next(userList);
    })

  }

  /**
   * 获取用户详细信息
   * @param id 用户id
   */
  getUserDetail(id:string) {
    return this.http.get(CFG.API.USER+'/id/'+id).map((r:Response) => {
      return r.json();
    })
      .catch(this.handleError)
      .subscribe((d:any) => {
        this.domainName.next(d.User.domainName);
        this.userDetailSubject.next(new UserClass(d.User))
      });
  }




  /**
   * 删除用户中的组
   * @param id 组id
   */
  deleteGroup(groupID:string,userID:string) {
    let body= {
      "Group": {
        "groupID": groupID
      }
    }
    this.http.delete(CFG.API.GROUP+"/"+groupID+"/user/"+userID)
      .map(this.mapFunction)
      .catch(this.handleError)
      .subscribe((d:any) => {
        let user = this.userDetailSubject.getValue();
        user.groups = user.groups.filter((g) => {
          return g.groupID !== groupID;
        })
        this.userDetailSubject.next(user);
        this.appNotification.success('用户组删除成功!');
      })

  }

  /**
   * 获取所有组列表
   */
  getGroups() {
    return this.http.get(CFG.API.GROUP).map((r:Response) => {
      return r.json();
    })
    .catch(this.handleError);
  }
  private mapFunction(r:Response) {
    return r.json();
  }
  private handleError(error: any) {
    //console.error('An error occurred', error.json()); // for demo purposes only
    //let errMsg = (error.message) ? error.message :error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    let errMsg = error.json().HttpResponseState.errorMessage;
    //console.error('eee',errMsg);
    return Observable.throw(errMsg);
  }
}
