/**
 * Created by fengjj on 2016/9/19.
 */
import {Component, AfterViewInit, Renderer, ElementRef, ViewChild, OnInit,}from '@angular/core';
import { ActivatedRoute ,Params ,Router } from '@angular/router';

import { RegService } from './reg.service';
//密码加密模块

import { AuthService } from '../../auth.service';
import { User } from "../../common/model/User";
import { computeMinHeight } from '../../common/service/compute-min-height';
import {AppContext} from "../../common/AppContext";
import {SIZES} from "../../common/size-in-documnet";

@Component({
  selector:'reg-set-password',
  templateUrl:'./reg-set-password.component.html',
  styleUrls:['./reg-set-password.component.css']
})
export class RegSetPasswordComponent implements AfterViewInit,OnInit{
  @ViewChild('appmain') appmain:ElementRef;
  @ViewChild('passwordRight') passwordRight:ElementRef;
  password:string;
  pswConfirm:string;
  pswErr = false;
  pswConfirmErr = false;
  consistencyErr = false;
  formErr = true;
  submited = false;
  passwordGrade:number;
  pswConfirmGrade:number;
  private userName = "";
  private tenantName = "";

  constructor(private regService:RegService,private router:Router, private route:ActivatedRoute,private authService:AuthService,private renderer:Renderer,private appContext : AppContext) {
  }

  ngOnInit(){
    console.log("ngOnInit");
    this.route.queryParams.subscribe((params) => {
      console.log("初始化",params);
      // this.email=params['email'];
      this.userName = params['username'];
      this.tenantName = params['tenantName'];
      if(this.appContext.user&&(this.userName!=this.appContext.user.userName)){
        this.appContext.destory();
      }
    });
  }

  ngAfterViewInit() {
    //computeMinHeight.setMinHeight(this.renderer,this.appmain.nativeElement);
    let winH = document.body.clientHeight || document.documentElement.clientHeight;
    this.renderer.setElementStyle(this.passwordRight.nativeElement,'height',winH - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT  +'px');
    // this.appContext.destory();
  }
  onSubmit() {
    if((this.passwordGrade !== null) && (this.pswConfirmGrade !== null) && (this.password === this.pswConfirm) ) {
      this.regService.setPassword(this.userName,this.password,this.tenantName).subscribe((u:User) => {
        if(u) {
          this.authService.loginSuccess(u);
          this.router.navigate(['/main/complete'])
        }
      });
    }else {
      this.consistencyErr = true;
    }
  }
  onPswBlur() {
    this.pswErr = this.passwordGrade === null;
  }
  onPswConfirmBlur() {
    this.pswConfirmErr = this.pswConfirmGrade === null;
  }
  passwordChange(val:string) {
    this.password = val;
    this.passwordGrade = this.authPasswd(val);
    if(this.passwordGrade !== null) {
      this.pswErr = false;
    }
    this.consistencyCheck();
  }
  pswConfirmChange(val:string) {
    this.pswConfirm = val;
    this.pswConfirmGrade = this.authPasswd(val);
    if(this.pswConfirmGrade !== null) {
      this.pswConfirmErr = false;
    }
    this.consistencyCheck();
  }
  private consistencyCheck() {
    if(this.consistencyErr) {
      this.consistencyErr = this.password !== this.pswConfirm;
    }
  }
  private authPasswd(string) {
    if(string.length >=6) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
        return 2
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /[^a-zA-Z0-9]+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          return 1;
        }else if(/\[a-zA-Z]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
          return 1;
        }else if(/[0-9]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
          return 1;
        }else{
          return 0
        }
      }
    }else{
      return null ;
    }
  }
}
