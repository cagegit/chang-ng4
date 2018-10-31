/**
 * Created by fengjj on 2016/10/25.
 */
import { Component ,Input ,EventEmitter ,Output ,ViewChild ,AfterViewInit ,ElementRef } from '@angular/core';
@Component({
  selector:'my-editer',
  template:`
  <div class="editer_box">
    <input type="text" #any value="{{myVal}}" (keyup.enter)="onEnterHandle(any.value)" placeholder="{{placeholder}}">
    <i class="iconfont icon-duihao save" (click)="onSaveHandle($event,any.value)"></i>
    <span class="split">|</span>
    <i class="iconfont icon-xxz cancel" (click)="onCancelHandle($event)"></i>
    <div class="self_error" *ngIf="hasErr"><i class="iconfont icon-buzhengque"></i>{{errMessage}}</div>
  </div>
  `,
  styles:[`
     .editer_box{ position: absolute; left: 0; top: 30px; width: 184px; padding: 0 45px 0 10px; height: 32px; border:1px solid #e7e7e8; border-radius: 3px; background-color: #f0f0f0; z-index:100}
    .editer_box:before,.editer_box:after{ position: absolute; left: 24px; top: -8px; content:''; border-bottom: 8px solid #e7e7e8; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: none; width: 0; height: 0; overflow: hidden; }
    .editer_box:after{ left: 25px; top: -7px; border-bottom: 8px solid #f0f0f0;}
    .editer_box input{ border:none; width:120px; outline: none; background-color: transparent; line-height: 30px; font-size:12px; color:#666;}
    .cancel{ position: absolute; right: 5px; color: #f04946; display: block; width: 16px; height: 20px; cursor: pointer; top: 4px;font-size:14px;text-align:right;line-height:20px;}
    .save{ position: absolute; right: 28px; display: block; width: 16px; height: 20px; line-height:20px;color: #53bb9b; top:4px; cursor: pointer; font-size:14px;text-align:right}
    .split{position:absolute; line-height: 30px;font-size: 12px;  color: #cbcbcb; top: -1px; right: 22px; }
    .self_error{ white-space:nowrap; left:10px;}
    .self_error i{  top:0;}
  `]
})
export class MyEditerComponent implements AfterViewInit {
  @Input('myVal') myVal:string;
  @Input('errMessage') errMessage:string;
  @Input('regStr') regStr:string;
  @Input('placeholder') placeholder:string;
  @Output() onSave = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @ViewChild('any') inputRef:ElementRef;
  private hasErr = false;
  ngAfterViewInit() {
    this.inputRef.nativeElement.focus();
  }
  onEnterHandle(val:string) {
    this.hasErr = !this.formatCheak(val);
    console.warn("hasErr:",this.hasErr);
    if(!this.hasErr){
      this.saveValue(val);
    }
  }
  onSaveHandle(e:MouseEvent,val:string) {
    e.cancelBubble = true;
    this.hasErr = !this.formatCheak(val);
    if(!this.hasErr){
      this.saveValue(val);
    }
  }
  onBlurHandle() {
    setTimeout(() => {this.onCancel.next()},500);
  }
  onCancelHandle(e:MouseEvent) {
    e.cancelBubble = true;
    this.onCancel.next();
  }
  private saveValue(val:string) {
    this.onSave.next(val);
  }

  private formatCheak(val:string):boolean{
    if(this.regStr){
      let reg = new RegExp(this.regStr);
      console.log("验证:",this.regStr,val,"结果:",new RegExp(this.regStr).test(val));
      return reg.test(val);
    }else{
      return false;
    }
  }
}
