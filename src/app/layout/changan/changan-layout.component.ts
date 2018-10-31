import { Component,ViewContainerRef, ViewChild } from '@angular/core';
import {AppState} from "../../app.service";
import {AppContext} from "../../common/AppContext";
import {AppWebSocketService} from "../../common/service/app.websocket.service";
import {ModalDirective} from "ng2-bootstrap";
import "../../rxjs-extensions";
import {Router, ActivatedRoute, NavigationEnd} from "@angular/router";
import {flyIn} from "../../animations";

@Component({
  selector: 'changan-layout',
  templateUrl: './changan-layout.component.html',
  styles: [`
    .app_nav {
      height:55px;
      line-height:55px;
    }
  `],
  animations: [
    flyIn
  ]
})

export class ChanganLayoutComponent {
  isDataCenter:boolean;
  isShowHead = false;
  @ViewChild('loginModal') public childModal:ModalDirective;

  constructor( public appState: AppState,public router: Router,public viewContainerRef: ViewContainerRef,public appContext : AppContext,private appWebSocketService:AppWebSocketService,private route: ActivatedRoute) {
    this.checkNewNotify();
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe((e:any) => {
      let reg = /data_set|\bdashboard\b|data-center|um|card/;
      this.isDataCenter = reg.test(e.url);
      this.isShowHead = e.url.indexOf('dashboard') >= 0;
    });
  }
  public disabled:boolean = false;

  public status:{isopen:boolean} = {isopen: false};

  public toggled(open:boolean):void {
    console.log('Dropdown is now: ', open);
  }

  public loginShow():void {
    // console.info("show",this.childModal);
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
