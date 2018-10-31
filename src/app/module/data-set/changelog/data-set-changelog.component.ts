import { Component } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LogService} from "../../../common/service/log.service";
import {Log} from "../../../common/model/log.model";

@Component({
  selector : 'data-set-changelog',
  templateUrl:'./data-set-changelog.component.html',
  styleUrls:['./data-set-changelog.component.css']
})
export class DataSetChangelogComponent{
  datasetLog:Log[];
  dataSetId:string;
  itemsPerPage:number = 20;
  totalItems:number;
  bigCurrentPage:number=1;
  nextText = `<i class="iconfont icon-jiantou-copy"></i>`;
  previousText = `<i class="iconfont icon-jiantouy-copy"></i>`;
  constructor(private logService:LogService,private route:ActivatedRoute,public router:Router){

  }

  getDSLog(){
    let curPage=this.bigCurrentPage-1;
    this.logService.getDataSetLog(this.dataSetId,curPage,this.itemsPerPage).subscribe(rep=>{
      this.datasetLog=rep.data as Log[];
      this.totalItems=rep.pageHelper.totalNumbers;
    })
  }
  pageChanged(e:any){
    this.bigCurrentPage=e.page;
    this.getDSLog();
  }
  ngOnInit(){
    this.route.params.subscribe((params) => {
      let id=params['id'];
      this.dataSetId=id;
      this.getDSLog();
    })
  }
}
