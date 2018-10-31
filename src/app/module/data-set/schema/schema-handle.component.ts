import {
  Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges, trigger, state, style, transition,
  animate, ViewEncapsulation, ViewChild, AfterViewInit
} from '@angular/core';
import {DataSet} from "../../../common/model/data-set.model";
import {ModalDirective} from "ng2-bootstrap";
import {SchemaHandle} from "../../../common/model/schema-handle.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../../app.notification";
import {DataSetService} from "../../../common/service/data-set.service";
import {Error} from "../../../common/model/Error";
@Component({
  selector : 'schema-handle',
  templateUrl:'./schema-handle.component.html',
  styleUrls:['./schema-handle.component.css']
})
export class SchemaHandleComponent implements OnInit,AfterViewInit{
    @Input() dataSet : DataSet;
    @Output() dataSetChange = new EventEmitter<DataSet>();
    //开始确认弹层
    @ViewChild('startConfirmModal') startConfirmModal:ModalDirective;
    //显示遮罩以及滚动条
    progressBar : boolean=false;
    SCHEMA_HANDLE_STATUS : any=SchemaHandle.STATUS;
    refreshTimer : any;

    constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification,private dataSetService : DataSetService){
    }


    ngOnChanges(changes: SimpleChanges){
      console.log('change',changes);
      let simpleChange=changes["dataSet"];
      if(simpleChange && !simpleChange.isFirstChange()){
        let currentDataSet=simpleChange.currentValue as DataSet;
        if(currentDataSet.dataSourceType!='mysql'&& currentDataSet.schemaHandle){
          this.refreshStatus();
        }
      }

    }


    ngOnInit() {
      console.log("shcema-handle:ngOnInit");
    }

    ngAfterViewInit() {
      console.log("shcema-handle:ngAfterViewInit",this.dataSet);
      // if(this.dataSet.schemaHandle){
      //   this.refreshStatus();
      // }
    }

    /**
     * 开始预计算
     */
    public startConfirm(){
      if(this.dataSet.schemaHandle.status==SchemaHandle.STATUS.READY_FOR_BUILD){
        this.startConfirmModal.show();
      }else if(this.dataSet.schemaHandle.status==SchemaHandle.STATUS.ERROR||this.dataSet.schemaHandle.status==SchemaHandle.STATUS.READY){
        this.startConfirmModal.show();
        // this.start();
      }
    }

    /**
     * 开始预计算
     */
    start(){
      this.dataSetService.updateSchemaHandle(this.dataSet.dataSetID).subscribe((schemaHandle : SchemaHandle)=>{
        this.dataSet.schemaHandle=SchemaHandle.build(schemaHandle);
        this.startConfirmModal.hide();
        this.refreshTimer=setTimeout(()=>{
          this.refreshStatus();
        },SchemaHandle.INTERVAL_TIME)
      },(error : Error)=>{
        this.appNotification.error(error.errMsg);
      })
    }

    stop(){
      if(this.refreshTimer){
        clearTimeout(this.refreshTimer);
      }
    }




    /**
     * 取消开始
     */
    startCancel(){
      this.startConfirmModal.hide();
    }


    refreshStatus(){
      console.log("refreshStatus");
      this.dataSetService.getSchemaHandle(this.dataSet.dataSetID).subscribe((schemaHandle : SchemaHandle)=>{
        this.dataSet.schemaHandle=SchemaHandle.build(schemaHandle);
        console.log("req update:",schemaHandle);
        if((this.dataSet.schemaHandle.status==SchemaHandle.STATUS.BUILDING)&&(this.dataSet.schemaHandle.completePercent<100)){
          this.refreshTimer=setTimeout(()=>{
            this.refreshStatus();
          },SchemaHandle.INTERVAL_TIME)
        }
      },(error : Error)=>{
        this.appNotification.error(error.errMsg);
      })

    }



}


