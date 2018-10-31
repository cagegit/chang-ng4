/**
 * Created by fengjj on 2017/4/11.
 */
import { Component ,OnInit} from '@angular/core'
import { Router, ActivatedRoute,Params,NavigationEnd} from '@angular/router'
import {Dashboard} from "../../common/model/dashboard.model";
import {DashboardService} from "../../common/service/dashboard.service";
import {DashboardTemplateService} from "../../common/service/dashboard-template.service";
import {DashboardTemplate} from "../../common/model/dashboard-template.model";

@Component({
  templateUrl:'./template-list.component.html',
  styleUrls:['./template-list.component.css']
})
export class TemplateListComponent{
  dashboard:Dashboard = null;
  curDashboardID:string;
  isTemplate = true;
  isPreview = false;
  dashboardTemplateList:Array<DashboardTemplate> = [];
  constructor(private route:ActivatedRoute,private dashboardService:DashboardService,private router:Router,private dashboardTemplateService:DashboardTemplateService){
    //console.log('template list')
    //this.router.events.filter(event => event instanceof NavigationEnd).subscribe((e:NavigationEnd)=>{
    //  let url = e.url;
    //  console.log('url',url);
    //  //this.selectDashboardSubject.next(this.dashboardID);
    //})
    //this.route.fragment.subscribe((data:any) => {
    //  console.log('url',data);
    //})

  }
  ngOnInit(){
    this.dashboardTemplateService.find().subscribe((list:DashboardTemplate[])=>{
      this.dashboardTemplateList = list;
      console.log("list init:",list);
      this.route.params.subscribe((params:Params)=>{
        if(params['id']){
          this.dashboardService.getDashboardById(params['id'],true).subscribe((data:any)=>{
            this.dashboard = Dashboard.build(data);
          })
        }else {
          let id = this.dashboardTemplateList[0].dashboardID;
          this.router.navigate(['template','dashboard',id])
        }
      })
    })
  }
  useTemplateFn(e:Event){
    this.dashboardTemplateService.createDashboard(this.dashboard?this.dashboard.templateID:null).subscribe((dashboardID:string)=>{
      this.dashboardService.dashboardListSubject.next(true);
      if(dashboardID){
        this.router.navigate(['dashboard',dashboardID]);
      }
    })
  }
}
