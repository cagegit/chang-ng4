/**
 * Created by houxh on 2017-1-12.
 */
import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {CardResult, Cell} from "../../common/model/card/card.resut";
import {QueryResult, QueryResultInfo} from "../../common/model/card/query.model";
import {CardUtils} from "./card.utils";
@Component({
  selector: 'showTxt',
  templateUrl: './card.showTxt.component.html',
  styles:[`.num_text{ font-size: 36px; color: #ef5451; padding:0 25px; line-height: 100px; }
.dscri_text{ padding: 0 25px; color: #666;}`]
})
export class ShowTxtComponent implements OnChanges {
  @Input() cardResult:any;
  @Input() cellSet:Array<Cell[]>;
  @Input() dataChange:number;
  showTxtObj:ShowTxtModel=new ShowTxtModel();

  ngOnChanges(changes:SimpleChanges):void {
    let cardResultChange = changes["cardResult"];
    if (cardResultChange) {
      this.cardResult = cardResultChange.currentValue;
      this.show();
    }
    let cellSetChange = changes["cellSet"];
    if (cellSetChange) {
      this.cellSet = cellSetChange.currentValue;
      this.setData();
    }
  }

  show():any {
    let context = '';
    let allData = this.cardResult;
    let desc = '';
    let index = 0;
    if (allData&&allData.cellset && allData.cellset.length > 0) {
      this.cellSet=allData.cellset;
      this.setData();
    }else if(allData&&allData.queryResult){
      let data= allData as QueryResultInfo;
      if(data.queryResult&&data.queryResult.results.length>0) {
        this.showTxtObj.context = data.queryResult.results[0][data.measureIndexs[0].index].toString();
      }
      if(data.queryResult&&data.queryResult.columnMetaList.length>0) {
        let desc='';
        for(let i=0;i<data.dimensionIndexs.length;i++){
          let key=data.queryResult.columnMetaList[data.dimensionIndexs[i].index].columnName;
          let value=data.queryResult.results[0][data.dimensionIndexs[i].index].toString();
          if(value){
            if(i>0&&data.dimensionIndexs[i].index==data.dimensionIndexs[i-1].index){
              desc+=CardUtils.getKey(data.dimensionIndexs[i],data.queryResult.columnMetaList[data.dimensionIndexs[i].index],value,i);
            }else{
              desc+=key+'-'+CardUtils.getKey(data.dimensionIndexs[i],data.queryResult.columnMetaList[data.dimensionIndexs[i].index],value,i)+'-';
            }
          }
        }
        this.showTxtObj.desc =desc+data.queryResult.columnMetaList[data.measureIndexs[0].index].columnName;
      }
    }else{
      this.showTxtObj.desc='';
      this.showTxtObj.context='';
    }
  }
  setData():any {
    let context = '';
    let desc = '';
    let index = 0;
    if (this.cellSet && this.cellSet.length > 0) {
      for (let row of this.cellSet) {//
        if (row[0].type == 'ROW_HEADER') {
          for (let i = 0; i < row.length; i++) {//let cell of row
            let cell = row[i];
            if (cell.type == 'ROW_HEADER') {
              desc += cell.value + ' - ';
            }
            if (cell.type == 'DATA_CELL') {
              index = i;
              context = cell.value;
              break;
            }
          }
          break;
        }
      }
      let colDesc = '';
      for (let row2 of this.cellSet) {
        for (let j = 0; j < row2.length; j++) {
          let cell2 = row2[j];
          if (cell2.type == 'COLUMN_HEADER' && j == index) {
            colDesc += cell2.value + ' - ';
          }
        }
      }
      desc += colDesc;
      if (desc.length > 0)
        desc = desc.substr(0, desc.length - 3);
    }
    this.showTxtObj.context = context;
    this.showTxtObj.desc = desc;
  }
}
export class ShowTxtModel {
  context:string;
  desc:string;
}
