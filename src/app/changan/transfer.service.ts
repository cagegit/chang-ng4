/**
 *
 * 组件之间共享数据
 *
 */
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Rx";

@Injectable()
export class TransferService {
  // Observable string sources
  private transferSource = new Subject<any>();

  // Observable string streams
  transfer$ = this.transferSource.asObservable();

  transferData(data) {
    this.transferSource.next(data);
  }
}
