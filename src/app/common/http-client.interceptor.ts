import { Injectable } from "@angular/core";
import { HttpInterceptor,HttpRequest,HttpHandler,HttpEvent,HttpResponse,HttpErrorResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {NgProgress} from "ngx-progressbar";
@Injectable()
export class HttpClientInterceptor implements HttpInterceptor {
  constructor(private ngProgressService : NgProgress) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.ngProgressService.start();

    return next.handle(request).pipe(tap(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
        this.ngProgressService.done();
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status===401 && err.error && err.error.errorMsg.indexOf('未登录')>=0) {
            let  redirectUrl = '';
            if (ENV === "production") {
              redirectUrl = location.protocol +'//'+location.host+'/dashboard/info';
              const postUrl = "http://10.10.26.2:19010/monitor2/login.html?redirectUrl=" + redirectUrl;
              window.location.href = postUrl;
            } else {
              const loginFrame:any = document.getElementById('loginIframe');
              const url = location.protocol +'//'+location.host+'/dashboard?token=admin';
              if(loginFrame) {
                loginFrame.src = url;
                setTimeout(() => {
                  window.location.reload();
                },300);
              }
            }
          }
        }
      }, () => {
        this.ngProgressService.done();
      }
    ));
  }
}
