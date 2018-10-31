/**
 * Created by fengjj on 2016/10/20.
 */
import { Component ,AfterViewInit , trigger ,state ,style ,transition ,animate ,OnInit} from '@angular/core';
import { AppNotification } from '../app.notification'
@Component({
  selector:'app-notification',
  template:`
    <div class="notify success_notify right_notification" *ngIf="successMessage" [@notifyState]="'in'">{{successMessage}}</div>
    <div class="notify err_notify err_notification" *ngIf="errMessage" [@notifyState]="'in'">{{errMessage}}</div>
  `,
  animations:[
    trigger('notifyState',[
      state('in',style({ top:'86px',opacity:1})),
      transition('void => in',[style({top:'-100px',opacity:0}),animate(500)]),
      transition('in => void',[animate(500,style({top:'-100px',opacity:0}))])
    ])
  ]

})
export class AppNotificationComponent implements OnInit , AfterViewInit{
  successMessage:string;
  errMessage:string;
  constructor(private appNotification:AppNotification) {}
  ngOnInit() {
    this.appNotification.successNotification.subscribe((mes:string) => {
      this.successMessage = mes;
      setTimeout(() => {
        this.successMessage = null;
      },3000)
    });
    this.appNotification.errorNotification.subscribe((mes:string) => {
      // console.log('error====',mes);
      this.errMessage = mes;
      setTimeout(() => {
        this.errMessage = null;
      },4000)
    })
  }
  ngAfterViewInit() {
    let i = 0;
    setTimeout(() => {
      //this.appNotification.errorNotification.next('error')
      //this.appNotification.success("保存成功！")
      //i++;
    },1000)
  }
}
