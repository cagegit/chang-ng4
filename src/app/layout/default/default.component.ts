import { Component, ViewEncapsulation, ViewContainerRef, ViewChild, ElementRef, Renderer } from '@angular/core';
import {SIZES} from "../../common/size-in-documnet";
import {AppState} from "../../app.service";
import {AuthService} from "../../auth.service";
import {AppContext} from "../../common/AppContext";
import {AppWebSocketService} from "../../common/service/app.websocket.service";
import {ModalDirective} from "ngx-bootstrap";
import "../../rxjs-extensions";
import {Router, ActivatedRoute, NavigationEnd} from "@angular/router";
import {flyIn} from "../../animations";

@Component({
  selector: 'layout-default',
  templateUrl: './default.component.html',
  // encapsulation: ViewEncapsulation.None,
  animations: [
    flyIn
  ]
})
export class LayoutDefaultComponent {
  isDataCenter:boolean;
  minHeight;
  @ViewChild('loginModal') public childModal:ModalDirective;
  _appContainer:ElementRef;
  @ViewChild('appContainer')
  set appContainer(ele:ElementRef){
    this._appContainer = ele;

    if(this.appContext.isLoggedIn){
      this.minHeight = (document.body.clientHeight || document.documentElement.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT;
    }else {
      this.minHeight = (document.body.clientHeight || document.documentElement.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT;
    }
    //this.renderer.setElementStyle(this.appContainer.nativeElement,'min-height',height+'px');
    //console.log('app',document.body.clientHeight,this.appContainer);
  };
  get appContainer(){
    return this._appContainer;
  }

  constructor( public appState: AppState,public authService: AuthService,public router: Router,public viewContainerRef: ViewContainerRef,public appContext : AppContext,private renderer:Renderer,private appWebSocketService:AppWebSocketService,private route: ActivatedRoute) {
    this.checkNewNotify();
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe((e:any) => {
      let reg = /data_center|data_set|dashboard|um|card/;
      this.isDataCenter = reg.test(e.url);
    });
  }
  public disabled:boolean = false;

  public status:{isopen:boolean} = {isopen: false};

  public toggled(open:boolean):void {
    console.log('Dropdown is now: ', open);
  }

  public loginShow():void {
    console.info("show",this.childModal);
    this.childModal.show();
  }

  public loginHide():void {
    this.childModal.hide();
  }
  public checkNewNotify(){
    let $this=this;
    this.appWebSocketService.successNotification.subscribe((s:string)=>{
      if(s){
        $this.appContext.hasNewNotify=true;
      }
    })
  }

}
