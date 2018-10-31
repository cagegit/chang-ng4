/**
 * Created by houxh on 2017-3-23.
 */
import {Component,Input,OnInit,Output,EventEmitter} from "@angular/core";
import { Router} from "@angular/router";
import {ChartUtil} from "../../../chart/chart.util";
import {SchemaHandle} from "../../../common/model/schema-handle.model";
import {QueryTemplate} from "../../../common/model/card/card.query.template";
import {Cell} from "../../../common/model/card/card.resut";
import {QueryInfo, QueryResult, QueryResultInfo} from "../../../common/model/card/query.model";
@Component({
  selector:'card-summary',
  templateUrl:'card.summary.component.html',
  styleUrls:['card.summary.component.css'],
  providers: [ChartUtil]
})
export class CardSummaryComponent implements OnInit{
  chart:any;
  options:any={};
  @Input() card;
  @Input() dataSet;
  @Output() alert=new EventEmitter<any>();
  @Output() delete=new EventEmitter<any>();
  // chartUtil:ChartUtil=this.chartUtil;
  renderMode:string;
  tableData:Array<object[]>;
  queryType='OLAP';
  query:any;
  constructor( public router:Router,private chartUtil:ChartUtil){

  }
  ngOnInit():void {
    let box= document.getElementsByClassName('d3_box')[0].getBoundingClientRect();
    this.options=this.chartUtil.options;
    this.renderMode=this.card.renderMode;
    this.queryType=this.card.queryType;
    if(this.card.queryType=='SQL'){
      this.query =JSON.parse(this.card.content.replace(/\n/g, ' ')) as QueryInfo;
    }else{
      this.query =JSON.parse(this.card.content.replace(/\n/g, ' ')) as QueryTemplate;
      console.log(this.query);
    }

    if(this.renderMode!='txt'&&this.renderMode!='table'&&this.renderMode!='originTable') {
      let pros = this.query.properties['saiku.ui.chart.options'];
      // this.chartUtil.options.chart.type=this.renderMode;
      this.chartUtil.options.chart['height']=box.height;
      this.chartUtil.options.chart['width']=box.width;
      // this.chartUtil.options.chart['backgroundColor']='#f8f9fb';
      this.chartUtil.options.legend.enabled=false;
      this.chartUtil.options.yAxis.gridLineWidth=0;
      this.chartUtil.options.yAxis.labels.enabled=false;
      this.chartUtil.options.xAxis.gridLineWidth=0;
      this.chartUtil.options.xAxis['labels']={enabled:false};
      this.chartUtil.options.colors=pros['colorScheme'];
      if(this.card.dataBrief){
        //  let headereCount=0;
        //  if(this.card.dataBrief.length>0){
        //    for(let row of this.card.dataBrief){
        //      if(row[0].type=='COLUMN_HEADER'||row[0].type=='ROW_HEADER_HEADER'){
        //        headerCount++;
        //      }else{
        //        break;
        //      }
        //    }
        //  }
        // let showData= this.card.dataBrief.splice(0,headerCount+50);
        // console.log('data:',this.card.dataBrief.splice(0,headerCount+10));
        setTimeout(()=>{
          if(this.queryType=='SQL'){
            let queryShowResult=new QueryResultInfo();
            let result=new QueryResult();
            let curQuery=this.query as QueryInfo;
            result.columnMetaList=curQuery.queryMeta;
            result.results=this.card.dataBrief;
            queryShowResult.queryResult=result;
            queryShowResult.dimensionIndexs=curQuery.dimensionIndexs;
            queryShowResult.measureIndexs=curQuery.measureIndexs;
            queryShowResult.properties=curQuery.properties;
            this.chartUtil.cardSummaryData(queryShowResult, this.card.renderMode, this.chart, this.queryType);
          }else {
            //OLAP
            this.chartUtil.cardSummaryData(this.card.dataBrief, this.card.renderMode, this.chart, this.queryType);
          }
        },100)

      }
    }else if(this.card.renderMode=='table'||this.card.renderMode=='originTable'){
      this.setTableData();
    }else if(this.card.renderMode=='txt'){
      this.setTxtData();
    }
  }

  saveInstance(chartInstance){
    this.chart=chartInstance;
  }

  gotoCard(needConfirm : boolean,cardID? : string){
    if(needConfirm&&(this.dataSet.schemaHandle)&&(this.dataSet.schemaHandle.status==SchemaHandle.STATUS.READY_FOR_BUILD)){
      this.alert.emit(cardID);
      return;
    }else{
      if(!cardID){
        //创建
        if(this.dataSet.dataSourceList&&this.dataSet.dataSourceList.length>1){
          this.router.navigate(['/card','SQL',{id:this.dataSet.dataSetID}]);
        }else{
          this.router.navigate(['/card','OLAP',{id:this.dataSet.dataSetID}]);
        }
        // this.router.navigate(['/card','SQL',this.dataSet.dataSetID]);
      }else{
        //编辑
        if(this.card.queryType=='SQL'||this.dataSet.dataSourceList&&this.dataSet.dataSourceList.length>1){
          this.router.navigate(['/card','SQL', {id:this.dataSet.dataSetID,cardId:cardID}]);
        }else{
          this.router.navigate(['/card','OLAP', {id:this.dataSet.dataSetID,cardId:cardID}]);
        }

      }
    }
  }

  delSelf(cardId:string){
    this.delete.emit(cardId);
  }

  setTableData(){
    this.tableData=new Array<object[]>();
    if(this.card.dataBrief&&this.card.dataBrief.length>0){
      if(this.queryType!='SQL') {
        let briefs = this.card.dataBrief as Array<Cell[]>;
        let index = 0;
        for (let row of briefs) {
          let cols = [];
          if (row[0].type == 'COLUMN_HEADER') {
            continue;
          } else {
            if (index > 4)
              return;
            let maxCount = row.length > 2 ? 2 : row.length;
            for (let j = 0; j < maxCount; j++) {
              cols.push(row[j].value);
            }
            this.tableData.push(cols);
            index++;
          }
        }
      }else{
        let curQuery=this.query as QueryInfo;
        let headerArr=[];
        let maxCount = curQuery.queryMeta.length > 2 ? 2 : curQuery.queryMeta.length;
        for(let i=0;i<maxCount;i++){
          headerArr.push(curQuery.queryMeta[i].columnName);
        }
        this.tableData.push(headerArr);
        for(let n=0;n<this.card.dataBrief.length;n++){
          if(n>3)
            return;
          let dataArr=[];
          for(let m=0;m<this.card.dataBrief[n].length;m++){
            if(m<2) {
              dataArr.push(this.card.dataBrief[n][m]);
            }
          }
          this.tableData.push(dataArr);
        }
      }
    }
  }
  setTxtData(){

  }
}
