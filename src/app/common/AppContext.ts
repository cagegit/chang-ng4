import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie";
import { CFG } from "./CFG";
import { User } from "./model/User";
import { AppWebSocketService } from "./service/app.websocket.service";
@Injectable()
export class AppContext {
  private _user: User;
  private _hasNewNotify: boolean;
  constructor(
    private cookieService: CookieService,
    private appWebSocketService: AppWebSocketService
  ) {
    let userFromCookie = cookieService.getObject(CFG.COOKIE_NAME.USER) as User;
    if (userFromCookie) {
      this._user = new User(
        userFromCookie.userId,
        userFromCookie.name,
        userFromCookie.domainName,
        // userFromCookie.userDisplayName,
        userFromCookie.userHeadImg,

        userFromCookie.admin,
        // userFromCookie.permission
        JSON.parse(localStorage.getItem(CFG.COOKIE_NAME.USER))
      );
      // this.appWebSocketService.listenLog();
    }
    // localStorage.setItem(CFG.COOKIE_NAME.USER,JSON.stringify(userFromCookie.permission));
    console.log("AppContext:init", this._user);
  }
  set hasNewNotify(isNew: boolean) {
    this._hasNewNotify = isNew;
  }
  get hasNewNotify() {
    return this._hasNewNotify;
  }
  hasPermission(permission): boolean {
    // return this.user?this.user.hasPermission(permission):false;
    // this.user?
    let permissions = JSON.parse(localStorage.getItem(CFG.COOKIE_NAME.USER));
    let index = permissions
      ? permissions.findIndex((temp: string) => {
          return temp == permission;
        })
      : -1;
    return this.user ? index > -1 : false;
  }

  get user(): User {
    // console.log(this._user);
    return this._user;
  }

  set user(user: User) {
    console.log(2);
    //清空cookie_name
    if (!user) {
      for (var cookieName in CFG.COOKIE_NAME) {
        this.cookieService.remove(CFG.COOKIE_NAME[cookieName]);
        localStorage.removeItem(CFG.COOKIE_NAME.USER);
      }
    } else {
      //set cookie_name
      let cookieUser = new User(
        user.id,
        user.name,
        // user.userDisplayName,
        // user.userHeadImg,
        user.password,
        user.domainName,
        user.admin
      );
      // this.cookieService.putObject(CFG.COOKIE_NAME.USER,user);
      this.cookieService.putObject(CFG.COOKIE_NAME.USER, cookieUser, {
        expires: this.expireDate()
      });
      localStorage.setItem(
        CFG.COOKIE_NAME.USER,
        JSON.stringify(user.permission)
      );
    }
    this._user = user;
  }

  expireDate(): string {
    let exp = new Date();
    exp.setTime(exp.getTime() + 7 * 24 * 60 * 60 * 1000);
    return exp.toUTCString();
  }

  get isLoggedIn(): boolean {
    return this.user ? true : false;
  }

  /**
   * 销毁
   */
  destory() {
    localStorage.removeItem(CFG.COOKIE_NAME.USER);
    this.user = null;
  }
}
