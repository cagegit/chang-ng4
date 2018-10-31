/**
 * Created by fengjj on 2017/3/28.
 */
import {Component, AfterViewInit, ViewChild, ElementRef, OnInit, OnDestroy} from '@angular/core';
import {DashboardService} from "../../service/dashboard.service";
import {AppNotification} from "../../../app.notification";
import {Dashboard} from "../../model/dashboard.model";
import {Observable, Subject} from "rxjs/Rx";
import {Error} from '../../model/Error'
import {ActivatedRoute,Router,NavigationEnd } from '@angular/router'
import {ParameterScope} from "typedoc/lib/utils/options/declaration";
import {Subscription} from "rxjs/Subscription";
import { DataHandleService } from '../../../changan/data.handle.service';
@Component({
  selector:'head-dashboard-list',
  templateUrl:'./head-dashboard-list.component.html',
  styleUrls:['./head-dashboard-list.component.css']
})
export class HeadDashboardListComponent implements OnInit,OnDestroy{
  @ViewChild('computeArea') computeArea:ElementRef;
  _dashboardList:Dashboard[]=[];
  hasComputeArea = true;
  showDashboardList:Dashboard[] = [];
  hiddenDashboardList:Dashboard[] = [];
  searchTermStream = new Subject<string>();
  filterText : string = '';
  dashboardID:string;
  inMore = false;
  curDashboardBgPosition = {
    width:0,
    left:-500
  };
  private maxShowIndex : number = 0;
  subscription : Subscription;
  private token='';
  constructor(private dashboardService:DashboardService,private appNotification : AppNotification,private route: ActivatedRoute,private router:Router,
              private dataHandleSer: DataHandleService){
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe((e:NavigationEnd)=>{
      let url = e.url;
      let routerTreeList =  url.split('/');
      if(routerTreeList.length === 3 && routerTreeList[1] == 'dashboard'){
        //分割为数组 删除最后一个元素 得到最后一个元素 即为id
        this.dashboardID = url.split('/').pop();
        this.isInMore();
        setTimeout(()=>{
          this.selectDashboard(this.dashboardID);
        },50)
      }else {
        this.inMore = false;
        this.curDashboardBgPosition = {left:-500,width:0}
      }
    });
    this.subscription=this.dashboardService.dashboardListSubject$.subscribe((b:boolean)=> {
      console.log("this.dashboardService.dashboardListSubject.subscribe", b);
      if (b) {
        this.getDashboardList();
      }
    });


  }

  ngOnInit(){
    console.log('head-dash init!!!!!!!!!');
    location.search.replace('?','').split('&').forEach(v => {
      if(v.indexOf('token')>=0) {
        this.token = v.replace(/token=/,'');
      }
    });
    this.dashboardService.dashboardListSubject.next(true);
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((term:string) => {
        return Observable.of(term)
      }).subscribe((term) => {
      this.filter(term);
    });
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


  get dashboardList() : Dashboard[]{
    return this._dashboardList||[];
  }

  set dashboardList(values : Dashboard[]){
    this._dashboardList=values
  }

  search(item:string) {
    this.searchTermStream.next(item);
  }

  filter(value : any){
    this.filterText=value;
    if(this.filterText){
      this.hiddenDashboardList = this.dashboardList.filter((temp:Dashboard)=> {
        return  new RegExp(this.filterText.toLowerCase()).test(temp.dashboardName.toLowerCase());
      });
    }else{
      this.hiddenDashboardList = this.dashboardList.slice(this.maxShowIndex);
    }
  }

  selectDashboard(id:string){
    if(!this.inMore){
      let target = <HTMLLIElement>document.getElementById(id);
      this.setCurDashboardBgPositon(target);
    }
  }
  private setCurDashboardBgPositon(li:HTMLLIElement){
    if(li){
      this.curDashboardBgPosition = li.getBoundingClientRect();
    }
  }


  resetMaxShowIndex(){
    let index = 0;
    let liMarginValue = 20;
    let winWidth = document.documentElement.clientWidth || document.body.clientWidth;
    let rightMargin = 400;
    //类数组转为数组
    let oLis = Array.from(this.computeArea.nativeElement.getElementsByTagName('li'));
    let width = 0;
    let maxShowWidth = winWidth - rightMargin;
    let len = oLis.length;
    let i = 0;
    for(;i < len;i++){
      let oLi = <HTMLLIElement>oLis[i];
      width += oLi.getBoundingClientRect().width + liMarginValue;
      if(width > maxShowWidth){
        this.maxShowIndex = i;
        break;
      }
    }
    if(i == len){
      this.maxShowIndex = len;
    }
    if(i == 0){
      this.maxShowIndex = 1;
    }
  }

  private changeShowDashboardListData(){
    this.resetMaxShowIndex();
    let index = this.maxShowIndex;
    this.showDashboardList = this.dashboardList.slice(0,index);
    this.hiddenDashboardList = this.dashboardList.slice(index);
    this.isInMore();
  }
  private isInMore(){
    for(let dashboard of this.hiddenDashboardList){
      if(dashboard.dashboardID == this.dashboardID){
        return this.inMore = true;
      }
    }
    this.inMore = false;
  }
  private getDashboardList(){
    this.dataHandleSer.getDashboards(this.token).subscribe((data:Dashboard[])=>{
      this.dashboardList = data;
      if(this.dashboardList.length>0){
        this.dataHandleSer.dashboardIdSubject.next(this.dashboardList[0].dashboardID);
      }
      setTimeout(()=>{
        this.changeShowDashboardListData();
        setTimeout(()=>{
          this.selectDashboard(this.dashboardID);
        },0)
      },0);
    },(error )=>{
      console.log(error);
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }
}
