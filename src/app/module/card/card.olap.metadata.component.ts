/**
 * Created by houxh on 2017-5-18.
 */
import {
  Component, Input, Renderer, ViewChild, ElementRef, OnChanges, SimpleChanges, trigger,
  state,
  style,
  transition,
  animate, Output, EventEmitter, OnInit
} from '@angular/core';
import {DataSet} from "../../common/model/data-set.model";
import {Measure} from "../../common/model/card/schema.measure";
import {Dimension} from "../../common/model/card/schema.dimension";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../app.notification";
import {DragulaService} from "ng2-dragula/index";
import {flyIn} from "../../animations";
import {MetaData} from "../../common/model/card/schema.metadata";
import {CardService} from '../../common/service/card.service'
import {Cube} from "../../common/model/card/schema.cube";
import {HashMap} from "../../common/model/card/card.query.template";
import {Error} from "../../common/model/Error"
import {DataSetService} from "../../common/service/data-set.service";
import { ChangService } from '../../changan/chang.service';
import { DataHandleService } from '../../changan/data.handle.service';
@Component({
  selector:'olap-metadata',
  templateUrl:'./card.olap.metadata.component.html',
  styleUrls:['./card.component.css'],
  animations: [
    flyIn,
    trigger('toLeftState', [
      state('inactive', style({
        transform: 'translateX(-147px)'
      })),
      state('active', style({
        transform: 'translateX(0)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-in')),
    ])
  ]
})
export class OlapMetaDataComponent implements OnInit,OnChanges{
  ngOnInit(): void {
    // console.log('init...');
    // this.getDataSets();
    // if(this.dataSetID){
    //   this.getAllMetaData();
    // }
  }

  // @Input() dataSets:DataSet[];
  // @Input() measureGroup:Set<string>;
  // @Input() measures:Measure[];
  // @Input() dimensions:Dimension[];
  dataSets:DataSet[];
  selectedDataSet:DataSet=new DataSet();
  showSql = false;
  measureGroup:Set<string>;
  measures:Measure[];
  dimensions:Dimension[];
  validCube:Cube;
  metaDataMap = new HashMap<string,MetaData>();
  @Input() dataSetID:string;
  @Input() toLeftStateStr = 'active';
  @Input() showFlagList:any;
  @Output() changeActive=new EventEmitter<any>();
  @Output() addMeasureEmit=new EventEmitter<any>();
  @Output() addDimensionEmit=new EventEmitter<any>();
  @Output() setMetaDataEmit=new EventEmitter<any>();
  @ViewChild('toLeftBtn') toLeftBtn:ElementRef;
  @ViewChild('leftContent') leftContent:ElementRef;
  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification, private renderer:Renderer,private cardService:CardService,private datasetService:DataSetService
  ,private dataHandleSer:DataHandleService) {

  }
  ngOnChanges(changes:SimpleChanges):void {
   let dataSetIDChange=changes['dataSetID'];
   if(dataSetIDChange) {
     this.getDataSets();
     if (this.dataSetID) {
       this.getAllMetaData();
     }
   }
   if(!this.dataSetID){
     this.selectedDataSet.dataSetName='请选择数据集';
     this.selectedDataSet.dataSetID='';
     this.measures?this.measures.splice(0,this.measures.length):this.measures;
     this.dimensions?this.dimensions.splice(0,this.dimensions.length):this.dimensions;
     this.measureGroup?this.measureGroup.clear():this.measureGroup;

   }
  }
  addMeasure(item:Measure){
    this.addMeasureEmit.emit(item);
  }
  addDimension(axisName:string, hierarchy:string, hierarchyCaption:string, levelName:string, levelCaption:string, dimensionName:string, levelIndex:number) {
    this.addDimensionEmit.emit({axisName:axisName,hierarchy:hierarchy,hierarchyCaption:hierarchyCaption,levelName:levelName,levelCaption:levelCaption,dimensionName:dimensionName,levelIndex:levelIndex});
  }
  getDataSets(){
    // this.datasetService.find().subscribe(rep=> {
    this.dataHandleSer.getDatasetList().subscribe(rep=> {
       if(rep && rep.data && Array.isArray(rep.data)) {
         this.dataSets = [];
         this.dataSets = rep.data as DataSet[];
         console.log(this.dataSets);
         this.dataSets.forEach(ds=> {
           if (ds.dataSetID == this.dataSetID) {
             this.selectedDataSet.dataSetName = ds.dataSetName;
             this.selectedDataSet.dataSetID=ds.dataSetID;
             if (ds.dataSourceType == 'code' || ds.dataSourceType == 'hive' || ds.dataSourceType == 'kylin') {
               this.showSql = true;
             }
             //如果当前数据集有多个数据源，那么直接跳转到SQL查询页
             if(ds.dataSourceList.length>1){
               this.router.navigate(['/card','SQL',this.dataSetID]);
             }
           }
           if(ds.dataSourceList.length>1){
             ds['queryType']='SQL';
           }else{
             ds['queryType']='OLAP';
           }
         })

       }
    })
  }
  /*
   * 获取connection信息
   */
  getAllMetaData() {
    this.dataHandleSer.getAllMetaData(this.dataSetID)
      .subscribe(res=> {
      if(res && res.data && Array.isArray(res.data)) {
        let metas = res.data as MetaData[];
        metas.forEach(meta=> {
          if (meta.cube.visible) {
            this.validCube = meta.cube;
          }
          this.metaDataMap.add(meta.cube.name, meta);
          if (meta.visible) {
            this.measureGroup = new Set<string>();
            this.measures = meta.measures;
            for (let i = 0; i < this.measures.length; i++) {
              this.measures[i].measureGroup = this.measures[i].calculated ? '计算指标' : meta.measures[i].measureGroup;
              this.measureGroup.add(this.measures[i].measureGroup);
            }
            this.measures.sort((a, b)=> {
              if (a.measureGroup > b.measureGroup) {
                return 1;
              } else if (a.measureGroup < b.measureGroup) {
                return -1;
              }
              return 0;
            })
            this.dimensions = meta.dimensions;

          }
        })
        this.setMetaDataEmit.emit({metaDataMap:this.metaDataMap,dimensions:this.dimensions,measures:this.measures,validCube:this.validCube,measureGroup:this.measureGroup});
      }
    }, (error)=> {
      if (error.errCode != 404) {
        this.appNotification.error(error.errMsg);
      }
    })
  }

  changeFolderState(e:any, changeClassName:string, curClassName:string) {
    let node = e.target;
    if (node.className.indexOf(curClassName) === -1) {
      node = node.parentNode;
    }
    if (node.className.indexOf(changeClassName) > -1) {
      this.renderer.setElementClass(node, changeClassName, false)
    } else {
      this.renderer.setElementClass(node, changeClassName, true)
    }
  }

  changeLeftFolderState() {
    let btnNode = this.toLeftBtn.nativeElement;
    if (btnNode.className.includes('icon-shouqi1')) {
      this.toLeftStateStr = 'inactive';
      this.renderer.setElementClass(btnNode, 'icon-shouqi1', false);
      this.renderer.setElementClass(btnNode, 'icon-zhankai', true);
      setTimeout(() => {
        this.renderer.setElementStyle(this.leftContent.nativeElement, 'display', 'none');
      }, 100)
    } else {
      this.toLeftStateStr = 'active';
      this.renderer.setElementStyle(this.leftContent.nativeElement, 'display', 'block');
      this.renderer.setElementClass(btnNode, 'icon-shouqi1', true);
      this.renderer.setElementClass(btnNode, 'icon-zhankai', false);
    }
    this.changeActive.emit({isLeft:true,status:this.toLeftStateStr});
    // setTimeout(() => {
    // this.changeSvgView();
    // }, 40)
  }

  //跳转到编辑dataset
  editDataSet() {
    this.router.navigate([`/data_set/${this.dataSetID}/schema`]);
  }

  navigateSQL() {
    this.router.navigate([`/data_set/${this.dataSetID}/query`]);
  }
}
