/**
 * Created by fengjj on 2017/4/10.
 */
import { Component ,Renderer ,AfterViewInit ,OnInit} from '@angular/core'
import {SIZES} from "../../common/size-in-documnet";
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
 template:`
  <div class="resend_success"   [style.height.px]="height">
  <div class="link_success">
    <img src="assets/img/link_success.png">
    <div class="link_text"><span>链接发送成功</span></div>
    <div class="link"><a href="http://{{lookEmailUrl}}"><i class="iconfont icon-doubleup-copy" ></i> 查看邮件</a></div>
  </div>
</div>
 `,
  styles:[`
  .resend_success{ position: relative; width: 100%;}
  .link_success{ width: 166px; height: 260px; position: absolute; top: 50%; left: 50%; margin-left: -83px; margin-top: -130px; text-align: center;}
  .link_text{ font-size: 20px; color: #333; line-height: 32px; margin-top: 35px;}
  .link{ line-height: 32px; text-align: left; width:120px; margin: 0 auto; }
  .link i{ font-size: 14px;}
  `]
})
export class ResendSuccessComponent implements AfterViewInit,OnInit{
  height:number;
  lookEmailUrl:string = '';
  constructor(private route:ActivatedRoute){}
  ngOnInit(){
    this.route.queryParams.subscribe((params:Params)=>{
      if('email' in params){
        this.lookEmailUrl += "mail."+params['email'].split('@')[1];
      }
    })
  }
  ngAfterViewInit(){
    this.height = (document.body.clientHeight || document.documentElement.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT;
  }
}
