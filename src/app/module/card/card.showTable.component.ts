/**
 * Created by houxh on 2017-1-8.
 */
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewEncapsulation,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer,
  AfterViewInit
} from "@angular/core";
import {CardResult, Cell} from "../../common/model/card/card.resut";
import {Measure, QueryTemplate, HashMap} from "../../common/model/card/card.query.template";
import {TemplateHelper, SortLevel} from "./templateHelper";
import {Dimension} from "../../common/model/card/schema.dimension";
import {CardUtils} from "./card.utils";
import {QueryMeta, QueryResult, QueryResultInfo, ShowColumn} from "../../common/model/card/query.model";
// import * as query from "../../common/model/card/card.query.template";
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'show-table',
  templateUrl: './card.showTable.component.html',
  styleUrls: ['./card.showTable.component.css']
})
export class ShowTableComponent implements OnChanges {
  @Input() drill:boolean;
  @Input() section:boolean;
  @Input() cardResult:any;
  @Input() showType:string;
  @Input() helper:TemplateHelper;
  @Input() fullScreen:boolean;
  @Input() page:number;
  @Input() totalPage:number;
  @Input() dimensions:Dimension[];
  @Input() dataChange:number;
  @Output() cellClickEvent = new EventEmitter<any>();
  @Output() changePageEvent = new EventEmitter();
  @Output() run = new EventEmitter<any>();
  @ViewChild('tableHead') tableHead:ElementRef;
  @ViewChild('tableBody') tableBody:ElementRef;
  private isLoading = false;
  private tableBoxHeight:number;
  private _tableBox:ElementRef;
  private moreLevel:boolean;
  //private prePosition:number = 0;
  //private isUpOfMouse:boolean;
  private isScrolling = false;

  @ViewChild('tableBox')
  set tableBox(value:ElementRef) {
    if (!this._tableBox) {
      this._tableBox = value;
      this._tableBox.nativeElement.addEventListener('scroll', (e:Event) => {
        let target = <HTMLDivElement>e.target;
        let top = target.scrollTop;
        if (top > 0) {
          this.setClassOfTableHead(true, top);
        } else {
          this.setClassOfTableHead(false);
        }
      })
      //this._tableBox.nativeElement.addEventListener('scroll',(e:Event) => {
      //  let bodyH
      //  if(!this.isLoading){
      //    bodyH = this.tableBody.nativeElement.getBoundingClientRect().height;
      //
      //  }
      //  let target = <HTMLDivElement>e.target;
      //  let top = target.scrollTop;
      //  if(top>this.prePosition){
      //    this.isUpOfMouse = false;
      //  }else{
      //    this.isUpOfMouse = true;
      //  }
      //  this.prePosition = top;
      //  console.log('isUpOfMouse',this.isUpOfMouse)
      //  if(top>0){ //头部置顶
      //    this.setClassOfTableHead(true,top);
      //
      //  }else{
      //    this.setClassOfTableHead(false);
      //  }
      //  if(!this.isLoading && !this.isUpOfMouse && (this.page < this.pageSize - 1) && (top+this.tableBoxHeight > 4/5*bodyH)){ //加载下一页
      //    this.isLoading = true;
      //    this.loadingData(true);
      //  }
      //  if(!this.isLoading && this.isUpOfMouse && this.page>0 && top < 1/5*bodyH){ // 加载上一页
      //    this.isLoading = true;
      //    this.loadingData(false);
      //  }
      //})

    }
  }

  get tableBox() {
    return this._tableBox;
  }

  aggTypes = [];
  rowHeaderLen:number;
  showHead:Array<TableCellModel[]> = new Array<TableCellModel[]>();
  showData:Array<TableCellModel[]> = new Array<TableCellModel[]>();
  allPath =new Array<DrillUpPath>();
  // mockData = new Array(100);
  // mockData2 = new Array(300);
  constructor(private renderer:Renderer) {

  }

  ngOnChanges(changes:SimpleChanges):void {
    let cardResultChange = changes["cardResult"];
    let drillChange = changes['drill'];
    let sectionChange = changes['section'];
    let fullScreenChange = changes['fullScreen'];
    let dataChange=changes['dataChange'];
    if (fullScreenChange) {
      this.computeTableBoxHeight();
    }
    if (cardResultChange && !cardResultChange.isFirstChange()) {
      this.isLoading = false;
      if (!this.isLoading) {
        if (this.isScrolling) {
          this.renderer.setElementClass(this.tableHead.nativeElement, 'self_absolute', false);
          setTimeout(()=> {
            this.computeTdWidth();
            this.renderer.setElementClass(this.tableHead.nativeElement, 'self_absolute', true);
          }, 0)
        }
      }
      this.cardResult = cardResultChange.currentValue;
      this.allPath.splice(0,this.allPath.length);
      this.etlCellSet();

      if (this.drill) {
        this.getDrillUpPath();
      }
    } else if (drillChange && !drillChange.isFirstChange()) {
      this.drill = drillChange.currentValue;
      this.etlCellSet();
      if (this.drill) {
        this.getDrillUpPath();
      }
    } else if (sectionChange && !sectionChange.isFirstChange()) {
      this.section = sectionChange.currentValue;
      this.etlCellSet();
    }
    else {
      this.etlCellSet();
    }
  }

  ngAfterViewInit() {
    this.computeTableBoxHeight();
    //this.computeTdWidth();
  }

  etlCellSet() {
    if(this.cardResult) {
      if(this.cardResult.cellset) {
        this.rowHeaderLen = 0;
        if (this.cardResult && this.cardResult.cellset && this.cardResult.cellset.length > 0) {
          this.aggTypes = this.getAggregatorAxis();
          this.getHeaders();
          this.etlData();
        } else{
          this.showData.splice(0, this.showData.length);
          this.showHead.splice(0, this.showHead.length);
        }
      }else if(this.cardResult&&this.cardResult.columnMetaList){
        this.getQueryHeaders();
        this.getQueryData();
      }else if(this.cardResult&&this.cardResult.queryResult&&this.cardResult.queryResult.columnMetaList){
        this.getPrettyQueryHeaders();
        this.getPrettyQueryData();
      }else{
        this.showData=[];
        this.showHead=[];
      }
    }else{
      this.showData=[];
      this.showHead=[];
    }
    // console.log("showData:",JSON.stringify(this.showData));
  }
getQueryHeaders(){
    let result= this.cardResult as QueryResult;
    let metas=result.columnMetaList;
  if(!this.showHead){
    this.showHead = new Array<TableCellModel[]>();
  }else if(this.showHead.length>0){
    this.showHead.splice(0,this.showHead.length);
  }
  let cols=[];
metas.forEach(meta=>{
  let head=new TableCellModel();
  head.class='td_bg';
  head.colspan=1;
  head.value=meta.columnName;
  cols.push(head);
})
  this.showHead.push(cols);
}
getQueryData(){
  let result=this.cardResult as QueryResult;
  let data=result.results;
  if(!this.showData){
    this.showData = new Array<TableCellModel[]>();
  }else if(this.showData.length>0){
    this.showData.splice(0,this.showData.length);
  }
  data.forEach(row=>{
    let rowArr=[];
    row.forEach((cell,n)=>{
      let col=new TableCellModel();
      col.value=cell.toString();
      rowArr.push(col);
    })
    this.showData.push(rowArr);
  })
}
  getPrettyQueryHeaders(){
    let result= this.cardResult as QueryResultInfo;
    let metas=result.queryResult.columnMetaList;
    let dimIndexs=result.dimensionIndexs;
    let measureIndexs=result.measureIndexs;
    if(!this.showHead){
      this.showHead = new Array<TableCellModel[]>();
    }else if(this.showHead.length>0){
      this.showHead.splice(0,this.showHead.length);
    }
    let cols=[];
    for(let i=0;i<dimIndexs.length;i++){
      if(i==0||dimIndexs[i].index!=dimIndexs[i-1].index) {
        let head = new TableCellModel();
        head.class = 'td_bg';
        head.colspan = 1;
        head.value = metas[dimIndexs[i].index].columnName;
        cols.push(head);
      }
    }
    for(let j=0;j<measureIndexs.length;j++){
      let head=new TableCellModel();
      head.class='td_bg';
      head.colspan=1;
      head.value=metas[measureIndexs[j].index].columnName;
      cols.push(head);
    }
// metas.forEach(meta=>{
//   let head=new TableCellModel();
//   head.class='td_bg';
//   head.colspan=1;
//   head.value=meta.columnName;
//   cols.push(head);
// })
    this.showHead.push(cols);
  }
  getPrettyQueryData(){
    let result=this.cardResult as QueryResultInfo;
    let dimIndexs=result.dimensionIndexs;
    let measureIndexs=result.measureIndexs;
    let data=result.queryResult.results;
    let meta=result.queryResult.columnMetaList;
    if(!this.showData){
      this.showData = new Array<TableCellModel[]>();
    }else if(this.showData.length>0){
      this.showData.splice(0,this.showData.length);
    }
    data.forEach(row=>{
      let rowArr=[];
      for(let i=0;i<dimIndexs.length;i++){
        if(i>0&&dimIndexs[i].index==dimIndexs[i-1].index){
          // let prevCol=rowArr[rowArr.length-1];
          rowArr[rowArr.length-1].value +=CardUtils.getKey(dimIndexs[i], meta[dimIndexs[i].index], row[dimIndexs[i].index].toString(),i).toString();
          // rowArr.push(prevCol);
        }else {
          let col = new TableCellModel();
          col.value = CardUtils.getKey(dimIndexs[i], meta[dimIndexs[i].index], row[dimIndexs[i].index].toString(),i).toString();
          rowArr.push(col);
        }
      }
      for(let i=0;i<measureIndexs.length;i++){
        let col=new TableCellModel();
        col.value=row[measureIndexs[i].index].toString();
        rowArr.push(col);
      }
      // row.forEach((cell,n)=>{
      //   let col=new TableCellModel();
      //   col.value=cell.toString();
      //   rowArr.push(col);
      // })
      this.showData.push(rowArr);
    })
  }

  getHeaders() {
    this.showHead = new Array<TableCellModel[]>();
    let cellset = this.cardResult.cellset;

    for (let i = 0; i < cellset.length; i++) {
      let colspan = 0;
      let colSpaning = false;
      let tHeads = [];
      if (cellset[i][0].type == "COLUMN_HEADER" || cellset[i][0].type == 'ROW_HEADER_HEADER') {
        for (let j = 0; j < cellset[i].length; j++) {
          if (cellset[i][0].type == "ROW_HEADER_HEADER") {
            if (cellset[i][j].type == "ROW_HEADER_HEADER") {
              this.rowHeaderLen++;
            }
          }
          if (colspan > 1) {
            colSpaning = true;
            colspan--;
          } else {
            colSpaning = false;
          }
          if (!colSpaning) {
            colspan = this.getMaxColSpan(cellset[i], j, cellset[i].length);
            colSpaning = colspan > 1 ? true : false;
            let tCell = new TableCellModel(cellset[i][j], colspan);
            let obj = this.checkSameRowHeaderValue(i, j);
            tCell.value = obj.value;
            tCell.class = this.getClass(cellset[i][j].type);
            tCell.class += obj.className;
            tHeads.push(tCell);
          } else {
            let tCell = new TableCellModel(cellset[i][j], 0);
            let obj = this.checkSameRowHeaderValue(i, j);
            tCell.value = obj.value;
            tCell.class = this.getClass(cellset[i][j].type);
            tCell.class += obj.className;
            tHeads.push(tCell);
          }
        }
        if (this.aggTypes.findIndex(t=> {
            return t == 'col'
          }) >= 0) {
          if (this.cardResult.colTotalsLists) {
            if (cellset[i][0].type == 'ROW_HEADER_HEADER') {
              let colHeaders = this.cardResult.colTotalsLists[0][0].captions;
              for (let ch = 0; ch < colHeaders.length; ch++) {
                let colHeadCell = new TableCellModel();
                colHeadCell.value = colHeaders[ch] + ' Grand Total';
                colHeadCell.class = 'td_bg';
                colHeadCell.colspan = 1;
                tHeads.push(colHeadCell);
              }
            }
            else if (cellset[i][0].type == "COLUMN_HEADER" && cellset[i][0].value == 'null') {
              let colHeaders = this.cardResult.colTotalsLists[0][0].captions;
              for (let ch = 0; ch < colHeaders.length; ch++) {
                let colHeadCell = new TableCellModel();
                colHeadCell.value = '';
                colHeadCell.class = 'td_bg';
                colHeadCell.colspan = 1;
                tHeads.push(colHeadCell);
              }
            }
          }
        }
        this.showHead.push(tHeads);
      } else {
        return;
      }
    }
  }

  etlData() {
    let startDataIndex = 0;
    let colTotalsColNum = 0;
    this.showData = new Array<TableCellModel[]>();
    let cellset = this.cardResult.cellset;
    for (let i = 0; i < cellset.length; i++) {
      if (cellset[i][0].type == "ROW_HEADER_HEADER") {
        startDataIndex = i;
      }
      if (cellset[i][0].type != "ROW_HEADER_HEADER" && cellset[i][0].type != "COLUMN_HEADER") {
        let tRow = [];
        //需要合并的列数
        let colspan = 0;
        //是否需要合并列
        let colSpaning = false;
        for (let j = 0; j < cellset[i].length; j++) {
          //计算合并列
          if (colspan > 1) {
            colSpaning = true;
            colspan--;
          } else {
            colSpaning = false;
          }
          if (!colSpaning) {
            colspan = this.getMaxColSpan(cellset[i], j, cellset[i].length);
            colSpaning = colspan > 1 ? true : false;
            let tCell = new TableCellModel(cellset[i][j], colspan);
            let obj = this.checkSameRowHeaderValue(i, j);
            tCell.value = obj.value;
            tCell.class = this.getClass(cellset[i][j].type);
            tCell.class += obj.className;
            tRow.push(tCell);
          } else {
            let tCell = new TableCellModel(cellset[i][j], 0);
            let obj = this.checkSameRowHeaderValue(i, j);
            tCell.value = obj.value;
            tCell.class = this.getClass(cellset[i][j].type);
            tCell.class += obj.className;
            tRow.push(tCell);
          }
        }

        //每行按列汇总
        if (this.aggTypes.findIndex(t=> {
            return t == 'col'
          }) >= 0) {
          if (this.cardResult.colTotalsLists) {
            if (cellset[i][0].type == 'ROW_HEADER') {
              let colDatas = this.cardResult.colTotalsLists[0][0].cells;
              colTotalsColNum = colDatas.length;
              if (colDatas.length == 0)
                return;
              for (let m = 0; m < colTotalsColNum; m++) {
                let colCell = colDatas[m][i - startDataIndex - 1];
                let colTotalCell = new TableCellModel();
                colTotalCell.value = colCell.value;
                colTotalCell.class = 'td_bg total-cell';
                colTotalCell.colspan = 1;
                tRow.push(colTotalCell);
              }
            }
          }
        }
        this.showData.push(tRow);
      }
    }
    //每列按行汇总
    if (this.aggTypes.findIndex(t=> {
        return t == 'row'
      }) >= 0) {
      if (this.cardResult && this.cardResult.rowTotalsLists && this.cardResult.rowTotalsLists.length > 0) {
        let totalRow = [];
        let totalCells = this.cardResult.rowTotalsLists[0][0].cells;
        if (totalCells.length == 0)
          return;
        let aggsCell = new TableCellModel();
        aggsCell.colspan = this.rowHeaderLen;
        aggsCell.value = 'Grand Total';
        aggsCell.class = 'td_bg total';
        // aggsCell.type = 'grand';
        totalRow.push(aggsCell);
        for (let r = 0; r < totalCells[0].length; r++) {

          let roCell = totalCells[0][r];
          let aggsValueCell = new TableCellModel();
          aggsValueCell.value = roCell.value;
          aggsValueCell.class = 'td_bg total-cell';
          aggsValueCell.colspan = 1;
          // aggsValueCell.type = 'DATA_CELL';
          totalRow.push(aggsValueCell);
        }
        if (this.showData[0].length > totalRow.length) {
          for (let i = 0; i < colTotalsColNum; i++) {
            let nullCell = new TableCellModel();
            nullCell.value = '';
            nullCell.class = 'td_bg total-cell';
            nullCell.colspan = 1;
            // nullCell.type = 'DATA_CELL';
            totalRow.push(nullCell);
          }
        }
        this.showData.push(totalRow);
      }
    }
  }

//获取上卷路径
  getDrillUpPath() {
    this.allPath.splice(0,this.allPath.length);
    this.helper.getHierarchyLevels();
    for (let h of this.helper.hierarchLevels.allKeys()) {
      if (this.helper.hierarchLevels.get(h).length > 1) {
        let upPath=new DrillUpPath();
        upPath.name=h;
        upPath.value=this.helper.hierarchLevels.get(h);
        this.allPath.push(upPath);
      }
    }

  }

//上卷
  drillUp(hierarchyName:string, level:SortLevel) {
    let hierarchy = this.helper.getHierarchy(hierarchyName);
    this.allPath.forEach(path=>{
      if (path.name==hierarchyName) {
        path.value.forEach(sl=> {
          if (sl.index > level.index) {
            this.helper.removeLevel(hierarchyName, sl.name);
          }
        })
      }
    })
    this.run.emit();
  }

  //查找同一列中value相同的个数(需要合并的列数)
  getMaxColSpan(cell:Cell[], index:number, maxIndex:number):number {
    let maxCol = 1;
    while (index < maxIndex - 1) {
      if (cell[0].type == 'COLUMN_HEADER' && cell[index].type == 'COLUMN_HEADER' && cell[index + 1].value == cell[index].value) {
        maxCol++;
      } else {
        break;
      }
      index++;
    }
    return maxCol;
  }

//获取汇总信息
  getAggregatorAxis():any {
    let aggTypes = [];
    let query = this.cardResult.query.queryModel;
    let colAgg = query.axes.COLUMNS['aggs'];
    let rowAgg = query.axes.ROWS['aggs'];
    if (colAgg && colAgg.length > 0)
      aggTypes.push('col');
    if (rowAgg && rowAgg.length > 0)
      aggTypes.push('row');
    return aggTypes;
  }

//设置单元格样式
  getClass(cellType:string) {
    switch (cellType) {
      case "COLUMN_HEADER":
      case "ROW_HEADER_HEADER":
        return 'td_bg';
      case "ROW_HEADER":
        return 'td_bg text_place';
      case "DATA_CELL":
        if (this.drill || this.section)
          return 'cellhighlight';
      default:
        return '';
    }
  }

  //获取json所有key值
  getKeySet(obj:Object) {
    let keys = [];
    for (let k in obj) {
      keys.push(k);
    }
    return keys;
  }

//检查当前单元格的值与上一行中同一索引的值是否相同
  checkSameRowHeaderValue(rowIndex:number, colIndex:number):any {
    let cellset = this.cardResult.cellset;
    // console.log('check...',rowIndex);
    if (rowIndex > 1) {
      if (cellset[rowIndex][colIndex].type == 'ROW_HEADER') {
        if ((cellset[rowIndex - 1][colIndex].type == 'ROW_HEADER' || cellset[rowIndex - 1][colIndex].type == 'ROW_HEADER_HEADER')
          && cellset[rowIndex][colIndex + 1].type != 'DATA_CELL' && cellset[rowIndex][colIndex].value == cellset[rowIndex - 1][colIndex].value) {
          return {value: "", className: ' cell_noborder'};
        } else {
          if (cellset[rowIndex][colIndex].value == 'null')
            return {value: "", className: ''};
          else
            return {value: cellset[rowIndex][colIndex].value, className: ' nobottom-border'};
        }
      } else {
        if (cellset[rowIndex][colIndex].value == 'null')
          return {value: "", className: ''};
        return {value: cellset[rowIndex][colIndex].value, className: ''};
      }
    }
    if (cellset[rowIndex][colIndex].value == 'null')
      return {value: "", className: ''};
    if (cellset[rowIndex][colIndex].type == 'ROW_HEADER')
      return {value: cellset[rowIndex][colIndex].value, className: ' nobottom-border'};
    return {value: cellset[rowIndex][colIndex].value, className: ''};
  }

//下钻时调用方法
  cellClick(x:number, y:number) {
    let cellset = this.cardResult.cellset;
    x = x + this.showHead.length;
    let drillOptions = CardUtils.getHitCellProperties(x, y, cellset);
    if(drillOptions) {
      let drillRowsDim = CardUtils.checkDrillDim(drillOptions.rows, this.dimensions);
      let drillColsDim = CardUtils.checkDrillDim(drillOptions.cols, this.dimensions);
      if (this.section || (this.drill && (drillColsDim || drillRowsDim))) {
        this.cellClickEvent.emit(drillOptions);
      }
    }
  }

  private computeTableBoxHeight() {
    if (this.tableBox) {
      this.tableBoxHeight = this.tableBox.nativeElement.getBoundingClientRect().height;
    }
  }

  private loadingData(isNext:boolean) {
    this.isLoading = true;
    //去掉isloading状态，修复第一页时，点击上一页，导致下一页不可点的bug
    // if(this.isLoading){
    //   return false;
    // }
    if (isNext) {
      //向下方法
      this.changePageEvent.emit(true);
    } else {
      //向上
      this.changePageEvent.emit(false);
    }
    // this.isLoading = true;
  }

  private computeTdWidth() {
    if (this.tableHead && this.tableBody) {
      let thsOfHead = this.tableHead.nativeElement ? this.tableHead.nativeElement.getElementsByTagName('th') : [],
        thsOfHeadLength = thsOfHead.length,
        firstTrOfBody = this.tableBody.nativeElement ? this.tableBody.nativeElement.getElementsByTagName('tr')[0] : null,
        tdsOfBody = firstTrOfBody ? firstTrOfBody.getElementsByTagName('td') : [],
        tdsOfBodyLength = tdsOfBody.length;
      for (let i = 0; i < thsOfHeadLength; i++) {
        let w = thsOfHead[i].getBoundingClientRect().width;
        this.renderer.setElementStyle(thsOfHead[i], 'min-width', `${w}px`);
      }
      for (let j = 0; j < tdsOfBodyLength; j++) {
        let w = tdsOfBody[j].getBoundingClientRect().width;
        this.renderer.setElementStyle(tdsOfBody[j], 'min-width', `${w}px`);
      }
    }
  }

  private setClassOfTableHead(b:boolean, top?:number) {
    if (b) {
      if (!this.isScrolling) {
        this.computeTdWidth();
        this.renderer.setElementClass(this.tableHead.nativeElement, 'self_absolute', true);
        this.isScrolling = true;
      }
      this.renderer.setElementStyle(this.tableHead.nativeElement, 'top', `${top}px`);
    } else {
      this.isScrolling = false;
      this.renderer.setElementClass(this.tableHead.nativeElement, 'self_absolute', false);
    }
  }
}
export class TableCellModel {
  // type:string;
  value:string;
  // position:string;
  colspan:number = 1;
  class:string;

  constructor(cell?:Cell, colspan?:number) {
    if (cell) {
      // this.setType(cell);
      // this.type = this.setType(cell);
      this.value = cell.value == 'null' ? '' : cell.value;
      // this.position = cell.properties.position;
      this.colspan = colspan;
      // this.type=cell.type;
    }
  }

  // setType(cell:Cell) {
  //   switch (cell.type) {
  //     case "COLUMN_HEADER":
  //       if (cell.value == 'null')
  //         this.type = "NULL_HEADER";
  //       else
  //         this.type = "COLUMN_HEADER";
  //       break;
  //     default:
  //       this.type = cell.type;
  //       break
  //   }
  // }
}
export class DrillUpPath{
  name:string;
  value:SortLevel[];
}

