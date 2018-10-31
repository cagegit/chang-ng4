/**
 * Created by houxh on 2017-2-22.
 */
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";

Injectable()
export class AppWebSocketService {
  successNotification = new Subject();

  constructor() {
    // this.listenLog();
  }

  ws:any;
  listenLog() {
    let $this=this;
    let protocol=window.location.protocol.indexOf("https")>-1?"wss":"ws";
    this.ws = new WebSocket(protocol+'://' + window.location.host + '/datasee/websocket/msgio');
    this.ws.onopen = function () {
      $this.start();
    };
    this.ws.onmessage = function (evt) {
      var msg = evt.data;

      if(msg!='OK') {
        console.log("数据已接收成功");
        $this.successNotification.next(msg);
      }else{
        console.log("数据已接收...", msg);
      }
      $this.reset();
    };
    this.ws.onclose = function () {
      // 关闭 websocket
      console.log("连接已关闭...");
      // $this.start();
    };
  }

  timeout = 59000;//60ms
  timeoutObj = null;
  reset() {
    clearTimeout(this.timeoutObj);
    this.start();
  };

  start() {
    let $this=this;
    this.timeoutObj = setTimeout(function () {
      $this.ws.send("check heart");
    }, this.timeout);
  }
}
