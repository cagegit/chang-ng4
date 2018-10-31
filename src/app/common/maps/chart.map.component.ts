/**
 * Created by houxh on 2017-6-14.
 */
import {Component, Input, Output, SimpleChanges, OnChanges, EventEmitter} from "@angular/core";
import {CardResult} from "../model/card/card.resut";
import {ChartUtil} from "../../chart/chart.util";
import {TemplateHelper} from "../../module/card/templateHelper";
import {Dimension} from "../model/card/schema.dimension";
import {CardUtils} from "../../module/card/card.utils";
@Component({
  selector: 'chart-maps',
  templateUrl: './chart.map.component.html',
  providers:[ChartUtil]
})
export class ChartMapComponent implements OnChanges {
  chart:any;
  options:Object;// = this.barChart.options;
  @Input() cardResult:CardResult;
  @Input() barChart:ChartUtil;
  @Input() chartType:string;
  @Input() drill:boolean = false;
  @Input() section:boolean = false;
  @Input() helper:TemplateHelper;
  @Input() dimensions:Dimension[];
  @Input() queryType:string;
  @Output() cellClickEvent = new EventEmitter<any>();
  @Input() dataChange:number;
  constructor(private chartUtil: ChartUtil) {
    if(!this.barChart){
      this.barChart=this.chartUtil;
    }

  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  onSeriesMouseOver(e:any) {
    let x = e.originalEvent.point.x;
    let y = e.context.index;
    this.pointClick(x, y);
  }

  pointClick(x, y) {
    if(this.queryType=='SQL')
      return;
    let cellset = this.cardResult.cellset;
    let yDisplace = 0;
    let xDisplace = 0;
    for (let row of cellset) {
      if (row[0].type == 'COLUMN_HEADER' || row[0].type == 'ROW_HEADER_HEADER') {
        xDisplace++;
        if (row[0].type == 'ROW_HEADER_HEADER') {
          for (let cell of row) {
            if (cell.type == 'ROW_HEADER_HEADER') {
              yDisplace++;
            }
          }
          break;
        }
      }
    }
    //cellset中包含header，因此需要在x上+header.Length
    x += xDisplace;
    y += yDisplace;
    let drillOptions = CardUtils.getHitCellProperties(x, y, cellset);
    if(drillOptions) {
      let drillRowsDim = CardUtils.checkDrillDim(drillOptions.rows, this.dimensions);
      let drillColsDim = CardUtils.checkDrillDim(drillOptions.cols, this.dimensions);

      if (this.section || (this.drill && (drillColsDim || drillRowsDim))) {
        // console.log('drill:',this.drill,this.section,drillRowsDim,drillColsDim);
        this.cellClickEvent.emit(drillOptions);
      }
    }
  }

  ngOnChanges(changes:SimpleChanges) {
    let chartTypeChange = changes["chartType"];
    let chartOptChange = changes['chartOpt'];
    let cardResultChange = changes["cardResult"];
    if (chartTypeChange||chartOptChange||cardResultChange) {
      this.options = this.barChart.options;
      setTimeout(()=>{
        this.barChart.handleData(this.cardResult, this.chartType, this.chart,this.queryType);
      },40)

    }

  }

  changViewFn(x:number, y:number) {
    setTimeout(()=> {
      this.barChart.changeView(x, y, this.chart);
    },40);
  }

  exportImgFn() {
    this.chart.exportChart();
  }
}
