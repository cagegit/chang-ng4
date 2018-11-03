/**
 * Created by houxh on 2017-5-22.
 */
import {
  animate, Component, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer, SimpleChanges, state, style,
  transition,
  trigger, ViewChild
} from '@angular/core';
import {DataSet} from "../../common/model/data-set.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../app.notification";
import {CardService} from "../../common/service/card.service";
import {DataSetService} from "../../common/service/data-set.service";
import {flyIn} from "../../animations";
import {DataSourceService} from "../../common/service/data-source.service";
import {DataSourceTable} from "../../common/model/data-source-table.model";
import {DataSourceTableField} from "../../common/model/data-source-table-field.model";
@Component({
  selector:'query-meta',
  templateUrl:'./card.query.metadata.component.html',
  styleUrls:['./card.query.metadata.component.css'],
  animations:[
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
export class QueryMetaDataComponent implements OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    let dataSetIDChange=changes['dataSetID'];
    if(dataSetIDChange) {
      this.getDataSets();
    }
    if(!this.dataSetID){
      this.selectedDataSet.dataSetName='请选择数据集';
    }
  }
  @ViewChild('toLeftBtn') toLeftBtn:ElementRef;
  @ViewChild('leftContent') leftContent:ElementRef;
  @Input() dataSetID:string;
  @Input() queryType:string;
  @Input() toLeftStateStr = 'active';
  @Output() changeActive=new EventEmitter<any>();
  @Output() addFieldEvent=new EventEmitter<any>();
  @Output() addTableEvent=new EventEmitter<any>();
  @Output() updateDataSourceCountEvent=new EventEmitter<any>();
  dataSets:DataSet[];
  selectedDataSet:DataSet=new DataSet();
  querySources=new Array<QuerySource>();
  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification, private renderer:Renderer,private cardService:CardService,private datasetService:DataSetService, private dataSourceService:DataSourceService) {

  }
  getDataSets(){
    this.datasetService.find().subscribe(rep=> {
      this.dataSets = [];
      this.querySources=[];
      this.dataSets = rep as DataSet[];
      this.dataSets.forEach(ds=> {
        if (ds.dataSetID == this.dataSetID) {
          this.selectedDataSet = ds;
          this.getDataSetTables(ds);
          this.updateDataSourceCountEvent.emit(ds.dataSourceList.length);
        }
      })

    })
  }

  getDataSetTables(ds:DataSet){
    let sources= ds.dataSourceList;
    let tables=ds.selectedTables;
    for(let source of sources){
      let querySource=new QuerySource();
      querySource.sourceName=source['dataSourceName'];
      querySource.sourceId=source['dataSourceID'];
      let sourceTables=[];
      for(let table of tables){
        let tableArr=table.split('.');
        if(source['dataSourceID']==tableArr[0]){
          let sourceTable=new DataSourceTable();
          sourceTable.tableName=tableArr[1]
          sourceTables.push(sourceTable);
        }
      }
      querySource.tables=sourceTables;
      this.querySources.push(querySource);
    }
  }

  getColumn(dataSourceId:string,tableName:string){
    this.dataSourceService.getTableInfo(dataSourceId,tableName,false).subscribe(rep=>{
      let table=DataSourceTable.build(rep);
      // table.tableFields=table.tableFields.map(field=>{
      //   return DataSourceTableField.build(field);
      // })
      // let table2=DataSourceTable.build(table);
      this.querySources.forEach(qs=>{
        if(qs.sourceId==dataSourceId){
          qs.tables.forEach(qst=>{
            if(qst.tableName==tableName){
              qst.tableFields=table.tableFields.map(field=>{
                return DataSourceTableField.build(field);
              });
            }
          })
        }
      })
    })
  }
  checkFieldStatus(dataSourceId:string,tableName:string):boolean{
    let status=false;
    this.querySources.forEach(qs=>{
      if(qs.sourceId==dataSourceId){
        qs.tables.forEach(qst=>{
          if(qst.tableName==tableName&&qst.tableFields&&qst.tableFields.length>0){
            status=true;
            return;
          }
        })
      }
    })
    return status;
  }
  changeFolderState(e:any, changeClassName:string, curClassName:string,dataSourceId:string,tableName:string) {
    let node = e.target;
    if (node.className.indexOf(curClassName) === -1) {
      node = node.parentNode;
    }
    if (node.className.indexOf(changeClassName) > -1) {
      this.renderer.setElementClass(node, changeClassName, false)
    } else {
      this.renderer.setElementClass(node, changeClassName, true)
    }
    if(!this.checkFieldStatus(dataSourceId,tableName)) {
      this.getColumn(dataSourceId, tableName);
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
  addField(filedName:string){
    this.addFieldEvent.emit(filedName);
  }
  addTable(tableName:string){
    this.addTableEvent.emit(tableName);
  }

}
export class QuerySource{
  sourceName:string;
  sourceId:string;
  tables:DataSourceTable[];
}
