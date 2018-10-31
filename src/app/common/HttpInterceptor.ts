import {Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend, Headers} from "@angular/http";
import {Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AppContext} from "./AppContext";
import "../rxjs-extensions";
import {AppNotification} from "../app.notification";
import {Error} from "./model/Error";
import {NgProgress} from "ngx-progressbar";

export class HttpInterceptor extends Http {

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private _router: Router,private appContext : AppContext,private appNotification : AppNotification,private ngProgressService : NgProgress) {
    super(backend, defaultOptions);
    console.info("HttpInterceptor:init",appContext,appNotification);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.request(url, options));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    this.interceptBefore();
    return this.intercept(super.get(url,this.getRequestOptionArgs(options)));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    this.interceptBefore();
    return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    this.interceptBefore();
    return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string,options?: RequestOptionsArgs): Observable<Response> {
    this.interceptBefore();
    return this.intercept(super.delete(url, options));
  }

  interceptBefore(options?: RequestOptionsArgs){
    // console.log("发送请求");
    this.ngProgressService.start();
  }


  getRequestOptionArgs(options?: RequestOptionsArgs) : RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers({'Content-Type': 'application/json'});
    }
    return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    var self=this;
    // this.ngProgressService.start();
    console.log('http *******');
    return observable
      // .timeout(CFG.API_SERVER.TIME_OUT, new Error(0,"系统请求超时!",""))
      .catch((err, source) => {
        console.log("统一拦截系统错误:",err);
         self.ngProgressService.done();
        if(err.constructor==Error){
          self.appNotification.error(`${err.errMsg}`);
          return Observable.empty();
        }
      if(!err.ok){
        try{
          err.json();
        }catch(error){
          self.appNotification.error(`SERVER ERROR:${err.status} - ${err.statusText}`);
          if (err.status  == 401) {
            console.log("统一登录拦截,跳转至登录页:",err.status);
            this.appContext.destory();
            //if (err.status  == 401 && !_.endsWith(err.url, 'login')) {
            this._router.navigate(['/login_domain']);
            return Observable.empty();
          }
        }
      }
      if (err.status  == 401) {
        console.log("统一登录拦截,跳转至登录页:",err.status);
        this.appContext.destory();
        //if (err.status  == 401 && !_.endsWith(err.url, 'login')) {
        this._router.navigate(['/main']);
        return Observable.empty();
      } else if(err.status === 400 && err.errorMsg.indexOf('未登录')>=0) {
        const redirectUrl = location.href || 'http://datasee.net/#/';
        const postUrl = "http://10.10.26.2:19010/monitor2/login.html?redirectUrl=" + redirectUrl;
        console.log(postUrl);
        window.location.href = postUrl;
      } else {
        return Observable.throw(err);
      }
    }).do((res : Response)=>{
        self.ngProgressService.done();
      });
  }
}
