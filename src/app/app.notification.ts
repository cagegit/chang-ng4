/**
 * Created by fengjj on 2016/10/20.
 */
import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

@Injectable()
export class AppNotification {
  successNotification = new Subject();
  errorNotification = new Subject();
  success(s:string) {
    this.successNotification.next(s);
  }
  error(s:string) {
    this.errorNotification.next(s);
  }
}
