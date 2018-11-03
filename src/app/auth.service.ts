import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie";
import { Router } from "@angular/router";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { User } from "./common/model/User";
import { AppContext } from "./common/AppContext";
import { CFG } from "./common/CFG";
import { AppWebSocketService } from "./common/service/app.websocket.service";


@Injectable()
export class AuthService {
  redirectUrl: string;
  constructor(private _cookieService: CookieService, public router: Router, private http: Http, private appContext: AppContext, private appWebSocketService: AppWebSocketService) {
  }
  /**
   * 用户名&密码认证
   * @param userName
   * @param userPw
   * @returns {Observable<T>|any}
     */
  login(domainName: string, userName: string, userPw: string): Observable<any> {
    let param = {
        "tenantName": domainName,
        "userName": userName,
        "password": userPw
    }
    return this.http.post(CFG.API.USER + '/login', param);
  }

  /**
   * 登陆成功后的操作
   * @param userInfo
     */
  loginSuccess(user: User) {
    console.log("loginSuccess:", user);
    //登录成功时，发起websocket请求
    // this.appWebSocketService.listenLog();
    console.log(this.appContext.user);
    this.appContext.user = user;
  }

  saveDomain(jsessionid: string) {
    this._cookieService.put(CFG.COOKIE_NAME.JSESSIONID, jsessionid);
  }

  logoutSuccess(): void {
    this.appContext.destory();
    this.router.navigate(["main"]);
  }


  logout(): void {
    this.http.post(CFG.API.USER + '/logout', "").toPromise().then(() => {
      console.info("退出成功");
      this.logoutSuccess();
    }).catch((response: any) => {
      console.error("退出失败", response.json().error.errorMessage);
    })
  }

  domainValidate(domain: string): Observable<any> {
    console.warn("验证域名:,domain", domain);
    return this.http.get(CFG.API.TENANT + "/validate/" + domain, {});
  }

  resetPw(email: string): Observable<any> {
    console.log("找回密码!", email);
    return this.http.post(CFG.API.USER + "/send/reset/password/email/" + email,null);
  }

}
