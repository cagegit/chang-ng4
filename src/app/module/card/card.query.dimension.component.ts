/**
 * Created by houxh on 2017-5-31.
 */
import {Component, Output, ViewChild, EventEmitter, Input} from "@angular/core";
import {QueryInfo, QueryMeta, ShowColumn} from "../../common/model/card/query.model";
import {ModalDirective} from "ng2-bootstrap";
import {Md5} from "ts-md5/dist/md5";
@Component({
  selector: 'query-dim',
  templateUrl: './card.query.dimension.component.html',
  styleUrls: ['./card.query.dimension.component.css']
})
export class QueryDimensionComponent {
  @Input() queryTemplate:QueryInfo;
  @Output() changeMetaEvent=new EventEmitter<any>();
  @ViewChild('setDimension') setDimension: ModalDirective;
  metaDatas: QueryMeta[];
  strMetas: ShowColumn[];
  numMetas: ShowColumn[];
  isNew=true;
  metaMD5:string;
  splitMetaData() {
    if (!this.strMetas) {
      this.strMetas = new Array<ShowColumn>();
    } else {
      this.strMetas.splice(0, this.strMetas.length);
    }
    if (!this.numMetas) {
      this.numMetas = new Array<ShowColumn>();
    } else {
      this.numMetas.splice(0, this.numMetas.length);
    }
    if (this.metaDatas) {
      this.metaDatas.forEach((meta, n) => {
        let newMeta = new ShowColumn();
        if (meta.columnType == ColType[0] || meta.columnType == ColType[2] || meta.columnType == ColType[3]) {
          newMeta.index = n;
          newMeta.showName = meta.columnName;
          newMeta.showType = meta.columnType;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
            return dim.showName==newMeta.showName;
            })!=-1){
            newMeta.selected=true;
          }
          this.strMetas.push(newMeta);
        }
        else if (meta.columnType == ColType[1]) {
          newMeta.index = n;
          newMeta.showName = meta.columnName;
          newMeta.showType = meta.columnType;
          if(this.queryTemplate.measureIndexs.findIndex(dim=>{
              return dim.showName==newMeta.showName;
            })!=-1){
            newMeta.selected=true;
          }
          this.numMetas.push(newMeta);
        }
        else if (meta.columnType == ColType[4]) {
          if (this.strMetas.findIndex(s => {
              return s.showName == '年';
            }) != -1) {
            return;
          }
          newMeta.showName = '年';
          newMeta.showType = meta.columnType;
          newMeta.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta.showName;
            })!=-1){
            newMeta.selected=true;
          }
          this.strMetas.push(newMeta);
          let newMeta2 = new ShowColumn();
          newMeta2.showName = '月';
          newMeta2.showType = meta.columnType;
          newMeta2.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta2.showName;
            })!=-1){
            newMeta2.selected=true;
          }
          this.strMetas.push(newMeta2);
          let newMeta3 = new ShowColumn();
          newMeta3.showName = '日';
          newMeta3.showType = meta.columnType;
          newMeta3.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta3.showName;
            })!=-1){
            newMeta3.selected=true;
          }
          this.strMetas.push(newMeta3);
        }
        else if (meta.columnType == ColType[5]) {
          if (this.strMetas.findIndex(s => {
              return s.showName == '时';
            }) != -1) {
            return;
          }
          newMeta.showName = '时';
          newMeta.showType = meta.columnType;
          newMeta.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta.showName;
            })!=-1){
            newMeta.selected=true;
          }
          this.strMetas.push(newMeta);
          let newMeta2 = new ShowColumn();
          newMeta2.showName = '分';
          newMeta2.showType = meta.columnType;
          newMeta2.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta2.showName;
            })!=-1){
            newMeta2.selected=true;
          }
          this.strMetas.push(newMeta2);
          let newMeta3 = new ShowColumn();
          newMeta3.showName = '秒';
          newMeta3.showType = meta.columnType;
          newMeta3.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta3.showName;
            })!=-1){
            newMeta3.selected=true;
          }
          this.strMetas.push(newMeta3);
        }
        else if (meta.columnType == ColType[6]) {
          if (this.strMetas.findIndex(s => {
              return s.showName == '年' || s.showName == '时';
            }) != -1) {
            return;
          }
          newMeta.showName = '年';
          newMeta.showType = meta.columnType;
          newMeta.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta.showName;
            })!=-1){
            newMeta.selected=true;
          }
          this.strMetas.push(newMeta);
          let newMeta2 = new ShowColumn();
          newMeta2.showName = '月';
          newMeta2.showType = meta.columnType;
          newMeta2.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta2.showName;
            })!=-1){
            newMeta2.selected=true;
          }
          this.strMetas.push(newMeta2);
          let newMeta3 = new ShowColumn();
          newMeta3.showName = '日';
          newMeta3.showType = meta.columnType;
          newMeta3.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta3.showName;
            })!=-1){
            newMeta3.selected=true;
          }
          this.strMetas.push(newMeta3);
          let newMeta4 = new ShowColumn();
          newMeta4.showName = '时';
          newMeta4.showType = meta.columnType;
          newMeta4.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta4.showName;
            })!=-1){
            newMeta4.selected=true;
          }
          this.strMetas.push(newMeta4);
          let newMeta5 = new ShowColumn();
          newMeta5.showName = '分';
          newMeta5.showType = meta.columnType;
          newMeta5.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta5.showName;
            })!=-1){
            newMeta5.selected=true;
          }
          this.strMetas.push(newMeta5);
          let newMeta6 = new ShowColumn();
          newMeta6.showName = '秒';
          newMeta6.showType = meta.columnType;
          newMeta6.index = n;
          if(this.queryTemplate.dimensionIndexs.findIndex(dim=>{
              return dim.showName==newMeta6.showName;
            })!=-1){
            newMeta6.selected=true;
          }
          this.strMetas.push(newMeta6);
        }
      })
    }
  }

  showModal(metaDatas: QueryMeta[]) {
    if(this.metaMD5){
      let newMetaMD5=Md5.hashStr(JSON.stringify(metaDatas)).toString();
      if(this.metaMD5==newMetaMD5){
        this.isNew=false;
      }else{
        this.metaMD5=newMetaMD5;
        this.isNew=true;
      }
    }else{
      this.metaMD5=Md5.hashStr(JSON.stringify(metaDatas)).toString();
    }
    if(this.isNew) {
      this.metaDatas = metaDatas;
      this.splitMetaData();
    }
    this.setDimension.show();
  }

  closeModal() {
    this.setDimension.hide();
  }

  selectMember(e: any, isDim: boolean, member: ShowColumn) {
    let status = e.target['checked'];
    if (isDim) {
      this.strMetas.forEach(meta => {
        if (meta.showName == member.showName) {
          if (status)
            meta.selected = true;
          else
            meta.selected = false;
        }
      })
    } else {
      this.numMetas.forEach(meta => {
        if (meta.showName == member.showName) {
          if (status)
            meta.selected = true;
          else
            meta.selected = false;
        }
      })
    }
  }

  saveMember(){
    let selectedDims=[];
    let selectedMeasures=[];
    this.strMetas.forEach(meta=>{
      if(meta.selected){
        selectedDims.push(meta);
      }
    })
    this.numMetas.forEach(meta=>{
      if(meta.selected){
        selectedMeasures.push(meta);
      }
    })
    if(selectedDims.length>0||selectedMeasures.length>0){
      this.changeMetaEvent.emit({dims:selectedDims,measures:selectedMeasures});
    }
    this.setDimension.hide();
  }
}

export enum ColType{
  STRING, NUMERIC, BOOLEAN, OBJECT, DATE, TIME, TIMESTAMP, OTHER
}
