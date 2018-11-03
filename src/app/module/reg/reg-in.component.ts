/**
 * Created by fengjj on 2016/9/19.
 */
import { Component ,AfterViewInit ,ViewChild ,ElementRef ,Renderer ,OnDestroy} from '@angular/core';
import { RegService } from './reg.service';
import { Router ,ActivatedRoute } from '@angular/router';
import { Tenant } from './Tenant.model';
import { AppNotification } from '../../app.notification';
import { MnFullpageService } from 'ngx-fullpage'
import {SIZES} from "../../common/size-in-documnet";
import {AppContext} from "../../common/AppContext";


interface TenantInfo {
  email:string
}

@Component({
  selector:'reg-in',
  templateUrl:'./reg-in.component.html',
  styleUrls:['./reg-in.component.css']
})
export class RegInComponent implements AfterViewInit ,OnDestroy {
  isValid = false;
  @ViewChild('createAccontModal') createAccontModal;
  @ViewChild('page2') page2:ElementRef;
  @ViewChild('zhezhao2') zhezhao2:ElementRef;
  tenantEmail:TenantInfo = {email:""};
  hasExist = false;
  submitted = false;
  emailActiveUrl = "";
  tenant:Tenant;
  public id:string;
  public email:string;
  public uuid:string;
  public emailReg = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,}){1,})$/;
  public pageOneHeight:number;
  public pageHeights = [];
  errMessage:string;
  public isIntroduce = false;
  constructor(private regService:RegService,private render:Renderer,private router:Router ,private route:ActivatedRoute ,private appNotification:AppNotification,private fullpageService: MnFullpageService,private appContext:AppContext){
    this.regService.errMessage.subscribe((err:string) => {
      this.appNotification.error(err);
    })
    if(this.router.url.indexOf('introduce') > -1) {
      this.isIntroduce = true;
    }
    console.log(process.env.HOST);
  }
  ngAfterViewInit() {
    this.setTopFunc();
    this.fullpageService.reBuild();
    this.pageOneHeight = (document.documentElement.clientHeight || document.body.clientHeight)-SIZES.HEAD_HEIGHT;
  }
  ngOnDestroy() {
    this.fullpageService.destroy("all");
    let fp_nav = <HTMLDivElement>document.getElementById('fp-nav');
    let html = <HTMLHtmlElement>document.getElementsByTagName('html')[0];
    if(fp_nav) {
      fp_nav.parentNode.removeChild(fp_nav);
      html.className = '';
    }
    document.body.style.overflow = 'auto';
    document.body.removeAttribute('style');
    document.body.className='scroll_bar';
    document.documentElement.removeAttribute('style');
  }
  onSubmit() {
    if(this.formChecked()) {
      this.router.navigate(['/main/setdomain',this.tenantEmail.email])
    }
  }
  onChangeHandle(v:string) {

  }
  onBlurHandle(e:Event,v:string) {
    e.stopPropagation();
    console.log('reg blur',v)
    console.log(process.env.HOST);
    this.tenantEmail.email = v;
    if(this.emailReg.test(this.tenantEmail.email)) {
      this.isValid = true;
      this.errMessage = null;
    }else {
      this.isValid = false;
    }
    this.formChecked();
  }
  onLeaveFn(){
    let _self = this;
    return (index: number, nextIndex: number,direction: string) =>{
      console.log(nextIndex)
      //let headerEle = document.querySelector('header');
      //if(nextIndex !== 1){
      //  if(_self.isIntroduce && _self.appContext.isLoggedIn){
      //    headerEle.style.marginTop = `-${SIZES.HEAD_HEIGHT + SIZES.HEAD_DASHBOARD_LIST_HEIGHT}px`;
      //  }else{
      //    headerEle.style.marginTop = `-${SIZES.HEAD_HEIGHT}px`;
      //  }
      //}else {
      //  headerEle.style.marginTop = `0px`;
      //}
      //console.log(document.querySelectorAll('.fp-section'))
      //if(!_self.pageHeights.length){
      //  document.querySelectorAll('.fp-section').forEach((ele:HTMLDivElement)=>{
      //    _self.pageHeights.push(parseInt(ele.style.height))
      //  })
      //}
    }
  }
  afterLoadFn(){
    let _self = this;
    return (anchorLink: string, index: number) => {
      //console.log('after load',index)
      //let fullpageWrapper = document.querySelectorAll('.fullpage-wrapper')[0]
      //let heights = _self.pageHeights.slice(0,index-1)
      //let translateY = heights.reduce((sum,h)=>{
      //  sum += h;
      //  return sum;
      //},0)
      //fullpageWrapper.style.transform = `translate3d(0px,${-translateY -SIZES.HEAD_HEIGHT }px,0px)`

    }
  }

  public formChecked() {
    if(this.tenantEmail.email && this.emailReg.test(this.tenantEmail.email)) {
      return true;
    }else {
      this.errMessage = "格式错误!";
      return false;
    }
  }
  public setTopFunc() {
    let width = document.documentElement.clientWidth || document.body.clientWidth ;
    let r = 2250;
    let top =-(Math.sqrt(r*r -(width/2)*(width/2))+r)+96;
    top = top < -4300 ? -4300 : top;
    this.render.setElementStyle(this.page2.nativeElement,'top',top+'px');
    this.render.setElementStyle(this.zhezhao2.nativeElement,'top',top+'px');
  }
}
