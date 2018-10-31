import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, Renderer, SimpleChanges, OnInit,
  OnChanges
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../../app.notification";
import {DataSet} from "../../../common/model/data-set.model";
import {DataSourceTable} from "../../../common/model/data-source-table.model";
import {DataSourceTableField} from "../../../common/model/data-source-table-field.model";
import {DataSourceKylinQueryService} from "../../../common/service/data-source-kylin-query.service";
import {Error} from "../../../common/model/Error";
import {MyEditorComponent} from "./my-editor.component";
import {Query} from "../../../common/model/query-model";

@Component({
  selector : 'data-set-query',
  templateUrl:'./data-set-query.component.html',
  styleUrls:['./data-set-query.component.css']
})
export class DataSetQueryComponent implements OnInit,OnChanges {
  @Input() dataSet:DataSet;
  // @ViewChild('editor') editor:ElementRef;
  @ViewChild(MyEditorComponent)
  private editorComponent: MyEditorComponent;

  queryTabFlags = {
    createQueryFlag: true,
    saveQueryFlag: false,
    historyQueryFlag: false
  }
  /**左侧可选数据表**/
  tableList:DataSourceTable[] = [];
  limit:number = 100;
  editorConfig : any = {
    mode: 'sql',
    editFlag: true
  }

  //已经保存的查询
  savedQueryList : Query[]=[];
  //历史记录的查询
  historyQueryList : Query[]=[];
  query : Query=new Query();
  resultTabList : Query[]=[];
  currentTab : Query;
  resultData : DataSourceTable;
  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification, private dataSource:DataSourceKylinQueryService, private renderer:Renderer) {

  }

  ngOnInit() {
    console.log('DataSetQueryComponent.ngOnInit', this.dataSet);
  }

  ngOnChanges(changes:SimpleChanges) {
    console.log('DataSetQueryComponent.change', changes);
    let simpleChange = changes["dataSet"];
    if (simpleChange && !simpleChange.isFirstChange()) {
      this.dataSet = simpleChange.currentValue as DataSet;
      this.dataSet = DataSet.build(this.dataSet);
      console.log("initDataSet:", this.dataSet);
      this.initPage();
    }
  }

  initPage() {
    this.dataSource.findAllTable(this.dataSet.dataSetID).subscribe((tables:DataSourceTable[])=> {
      this.tableList = tables.map((temp:DataSourceTable)=> {
        return DataSourceTable.build(temp);
      });
      DataSourceTable.sort(this.tableList);
    }, (error:Error)=> {
      console.warn("出错啦!", error, this.appNotification);
      this.appNotification.error(error.errMsg);
    });
  }

  initSavedQueryList(){
    this.dataSource.findSavedQuery(this.dataSet.dataSetID).subscribe((querys:Query[])=> {
      this.savedQueryList=querys;
    }, (error:Error)=> {
      this.appNotification.error(error.errMsg);
    });
  }

  initHistoryQueryList(){
    this.dataSource.findHistoryQuery(this.dataSet.dataSetID).subscribe((querys:Query[])=> {
      this.historyQueryList=querys;
    }, (error:Error)=> {
      this.appNotification.error(error.errMsg);
    });
  }

  executeQuery(query?:Query){
    if(!this.editorComponent.editor.getValue()){
      this.appNotification.error("请输入SQL语句!");
      return;
    }
    if(!query){
      query=new Query();
      query.sql=this.editorComponent.editor.getValue();
      query.setDefaultID();
      this.resultTabList.push(query);
      this.changeResultTab(query);
    }
  }

  saveQuery(){
    let query={'sql':this.editorComponent.editor.getValue()} as Query;
    this.dataSource.saveOrUpdateQuery(this.dataSet.dataSetID,query).subscribe((query:Query)=> {

    }, (error:Error)=> {
      this.appNotification.error(error.errMsg);
    });
  }

  updateQuery(query : Query){
    this.dataSource.saveOrUpdateQuery(this.dataSet.dataSetID,query).subscribe((query:Query)=> {

    }, (error:Error)=> {
      this.appNotification.error(error.errMsg);
    });
  }

  export(query : Query,e : any){
    let link=this.dataSource.export(this.dataSet.dataSetID,query);
    window.open(link);
  }

  changeQueryTab(key:string){
    for(let k in this.queryTabFlags){
      if(key === k){
        this.queryTabFlags[k] = true;
      }else{
        this.queryTabFlags[k] = false;
      }
    }

    if(this.queryTabFlags.saveQueryFlag){
      this.initSavedQueryList();
    }else if(this.queryTabFlags.historyQueryFlag){
      this.initHistoryQueryList();
    }

  }

  changeResultTab(query : Query){
    console.log("changeResultTab:",query);
    this.currentTab=query;
    query.limit=this.limit;
    this.dataSource.executeQuery(this.dataSet.dataSetID,query).subscribe((resultData:DataSourceTable)=> {
      console.log("查询结果: executeQuery",resultData);
      this.resultData=resultData;
    }, (error:Error)=> {
      this.appNotification.error(error.errMsg);
    });

  }

  delResultTab(index : number,query : Query){
    this.resultTabList=this.resultTabList.filter((temp : Query)=>{
      return query.queryID!=temp.queryID;
    });
    console.log("index:",index,JSON.stringify(this.resultTabList));
    if(this.resultTabList.length>0){
      let newIndex=index<this.resultTabList.length?index:this.resultTabList.length-1;
      console.log("index:",newIndex,this.resultTabList);
      this.currentTab=this.resultTabList[newIndex];
    }
  }

  folderFn(tableName : string,e:MouseEvent){
    let target = <HTMLElement>e.target;
    let pNode = <HTMLElement> target.parentNode;
    let index = pNode.className.indexOf('query_folder');
    if(index>-1){
      this.renderer.setElementClass(pNode,'query_folder',false);
    }else{
      this.renderer.setElementClass(pNode,'query_folder',true);
    }
    console.log("folderFn:",tableName);
  }
  resizeEidtorFn({folderFlag,ele}){
    let pNode = ele.parentNode;
    this.renderer.setElementClass(pNode,'max_history_query',folderFlag);
    console.log(folderFlag,ele.parentNode);
  }

}

