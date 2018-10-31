/**
 * Created by fengjj on 2017/4/11.
 */
import { Component } from '@angular/core';
import {ActivatedRoute, Router, Params} from "@angular/router";
import {AppNotification} from "../../app.notification";
import {DataSetService} from "../../common/service/data-set.service";
import {DataSource} from "../../common/model/data-source.model";
import {DataSourceService} from "../../common/service/data-source.service";
import {DataSet} from "../../common/model/data-set.model";
import {DashboardTemplateService} from "../../common/service/dashboard-template.service";
import {Error} from "../../common/model/Error";
import {Loading} from "../../common/loading.mask.util";
import {SchemaHandle} from "../../common/model/schema-handle.model";
@Component({
  templateUrl:'./template-data.component.html',
  styleUrls:['./template-data.component.css']
})
export class TemplateDataComponent{
  _dataSetList : DataSet[];
  _dataSourceList : DataSource[];
  dataSourceType : string="";
  dashboardID : string="";
  DATA_TYPE={
    DATASOURCE : "dataSource",
    DATASET : "dataSet"
  }
  get dataSourceList() : DataSource[]{
    return this._dataSourceList;
  }

  set dataSourceList(dataSourceList : DataSource[]){
    this._dataSourceList=dataSourceList.sort((x:DataSource, y:DataSource)=> {
      return  y.createdTime-x.createdTime;
    });
  }
  get dataSetList() : DataSet[]{
    return this._dataSetList;
  }

  set dataSetList(dataSetList : DataSet[]){
    this._dataSetList=dataSetList.sort((x:DataSet, y:DataSet)=> {
      return  y.updatedTime-x.updatedTime;
    });
  }


  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification,private dataSetService : DataSetService,private dataSourceService : DataSourceService,private dashboardTemplateService : DashboardTemplateService){

  }

  ngOnInit(){
    this.route.params.subscribe((params:Params)=>{
      this.dashboardID=params['dashboardID'];
      this.dataSourceType=params['dataSourceType'];
      this.initPage();
    })
  }

  initPage(){
    //数据集列表
    this.dataSetService.find(this.dataSourceType).subscribe((dataSetList : DataSet[])=>{
      this.dataSetList=dataSetList.map((dataSet : DataSet)=>{
        return DataSet.build(dataSet);
      });
      this.checkDataSetStatus();
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });

    //数据源列表
    this.dataSourceService.find().subscribe((dataSourceList : DataSource[])=>{
      this.dataSourceList=dataSourceList.filter((dataSource : DataSource)=>{
        return dataSource.dataSourceType==this.dataSourceType
      }).map((dataSource : DataSource)=>{
        return DataSource.build(dataSource);
      });
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }


  checkDataSetStatus(){
    for (let dataSet of this.dataSetList) {
      this.dataSetService.getSchemaHandle(dataSet.dataSetID).subscribe((schemaHandle : SchemaHandle)=>{
        if(schemaHandle.status==SchemaHandle.STATUS.READY){
          dataSet.schemaHandle=SchemaHandle.build(schemaHandle);
        }
      },(error : Error)=>{
        console.warn(error.errMsg);
      });
    }
  }



  updateData(flag:string,id :string){
    Loading.addCircleLoading();
    if(this.DATA_TYPE.DATASET==flag){
      this.dashboardTemplateService.updateDataByDataSet(this.dashboardID,id).subscribe((data : any)=>{
        Loading.removeLoading();
        this.router.navigate([`/dashboard/${this.dashboardID}`]);
      },(error : Error)=>{
        Loading.removeLoading();
        this.appNotification.error(error.errMsg);
      });
    }else if(this.DATA_TYPE.DATASOURCE==flag){
      this.dashboardTemplateService.updateDataByDataSource(this.dashboardID,id).subscribe((data : any)=>{
        Loading.removeLoading();
        this.router.navigate([`/dashboard/${this.dashboardID}`]);
      },(error : Error)=>{
        Loading.removeLoading();
        this.appNotification.error(error.errMsg);
      });
    }
  }

  createDataSource(){
    this.router.navigate([`/data_center/source/update/${this.dataSourceType}`,{dashboardID : this.dashboardID}])
  }

  cancel(){
    this.router.navigate([`/dashboard/${this.dashboardID}`]);
  }



}
