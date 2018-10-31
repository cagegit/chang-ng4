/**
 * Created by houxh on 2017-6-1.
 */
import {
  Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewChild
} from "@angular/core";
import {ChartUtil} from "../../chart/chart.util";
import {QueryInfo, QueryResult, QueryResultInfo} from "../../common/model/card/query.model";
import {ChartHighChartComponent} from "../../chart/chart.highchart.component";
import {ChartMapComponent} from "../../common/maps/chart.map.component";
@Component({
 selector:'query-pretty',
  templateUrl:'./card.query.prettyshow.component.html',
  styleUrls:['./card.query.prettyshow.component.css']
})
export class QueryPrettyShowComponent implements OnChanges,OnInit{

  @Input() chartUtil:ChartUtil;
  @Input() chartType:string;
  @Input() showType:string;
  @Input() iconType:string;
  @Input() cardId:string;
  @Input() dataSetID:string;
  @Input() curPage:number;
  @Input() totalPage:number;
  @Input() fullScreenFlag:boolean;
  @Input() toRightStateStr: string;
  @Input() toLeftStateStr: string;
  @Input() cardResult:QueryResultInfo;
  @Output() changePageEvent=new EventEmitter<any>();
  queryType='SQL';
  @Input() dataChange:number;
  // @ViewChild('svgChartBox') svgChartBox: ElementRef;
  private _svgChartBox:ElementRef;
  @ViewChild('svgChartBox')
  set svgChartBox(val:ElementRef){
    this._svgChartBox=val;
  }
  get svgChartBox(){
    return this._svgChartBox;
  }
  @ViewChild('chartmap') chartmap:ChartMapComponent;
  @ViewChild('highchart') highchart: ChartHighChartComponent;
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let chartTypeChange = changes['chartType'];
    let showTypeChange = changes['showType'];
    let toRightStateStrChange = changes['toRightStateStr'];
    let toLeftStateStrChange = changes['toLeftStateStr'];
    let cardResultChange=changes['cardResult'];
    if ((chartTypeChange&&!chartTypeChange.isFirstChange()) || (showTypeChange&&!showTypeChange.isFirstChange()) || (toRightStateStrChange&&!toRightStateStrChange.isFirstChange())
      || (toLeftStateStrChange&&!toLeftStateStrChange.isFirstChange())||cardResultChange&&!cardResultChange.isFirstChange()) {
      if(this.showType=='chart') {
        this.changeSvgView();
      }
    }
    else{
      if(this.showType=='chart') {
        this.changeSvgView();
      }
    }
  }
  changeSvgView() {
    setTimeout(() => {
      if (this.svgChartBox) {
        let svgBoxInfo = this.svgChartBox.nativeElement.getBoundingClientRect();
        // console.log('x,y2:',svgBoxInfo.width,svgBoxInfo.height);
        // this.highchart.changViewFn(800, 600);
        if(this.chartType=='china-map'){
          this.chartmap.changViewFn(svgBoxInfo.width, svgBoxInfo.height);
        }else {
          this.highchart.changViewFn(svgBoxInfo.width, svgBoxInfo.height);//.changeView(svgBoxInfo.width, svgBoxInfo.height);//
        }
      }
    }, 300);
  }
  exportImage() {
    if (this.showType == 'table' || this.showType == 'txt') {
      alert('图片只可以导出图表，不可以导出表格和文本');
      return;
    }
    if(this.chartType=='china-map'){
      this.chartmap.exportImgFn();
    }else {
      this.highchart.exportImgFn();
    }
    return false;
  }
  pagination(next:boolean){
    this.changePageEvent.emit(next);
  }
}
