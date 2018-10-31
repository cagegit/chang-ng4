/**
 * Created by houxh on 2017-3-7.
 */
import { Component, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnDestroy } from "@angular/core"
import { CardResult } from "../common/model/card/card.resut";
import { ChartUtil } from "./chart.util";
import { CardUtils } from "../module/card/card.utils";
import { TemplateHelper } from "../module/card/templateHelper";
import { Dimension } from "../common/model/card/schema.dimension";
@Component({
  selector: 'chart-highChart',
  templateUrl: './chart.highchart.component.html',
  providers:[ChartUtil]
})
export class ChartHighChartComponent implements OnChanges {

  chart: any;
  options: Object;// = this.barChart.options;
  @Input() cardResult: CardResult;
  @Input() barChart: ChartUtil;
  @Input() chartType: string;
  @Input() drill: boolean = false;
  @Input() section: boolean = false;
  @Input() helper: TemplateHelper;
  @Input() dimensions: Dimension[];
  @Input() queryType: string;
  @Output() cellClickEvent = new EventEmitter<any>();
  @Input() dataChange: number;
  constructor(private chartUtil: ChartUtil) {
    if (!this.barChart) {
      this.barChart = chartUtil;
    }

  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  onSeriesMouseOver(e: any) {
    let x = e.originalEvent.point.x;
    let y = e.context.index;
    this.pointClick(x, y);
  }

  pointClick(x, y) {
    if (this.queryType == 'SQL')
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
    if (drillOptions) {
      let drillRowsDim = CardUtils.checkDrillDim(drillOptions.rows, this.dimensions);
      let drillColsDim = CardUtils.checkDrillDim(drillOptions.cols, this.dimensions);

      if (this.section || (this.drill && (drillColsDim || drillRowsDim))) {
        // console.log('drill:',this.drill,this.section,drillRowsDim,drillColsDim);
        this.cellClickEvent.emit(drillOptions);
      }
    }
    // if (drillOptions) {
    //   for (let c of drillOptions.cols) {
    //     let cLevelArr = c.level.split('.');
    //     let cLevelName = cLevelArr[cLevelArr.length - 1].replace(/[\[\]]/g, '');
    //     let ch = this.helper.getHierarchy(c.hierarchy);
    //     if (ch) {
    //       let meArr = c.uniquename.split('.');
    //       let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
    //       ch.levels[cLevelName].selection = {
    //         type: "INCLUSION",
    //         members: [{
    //           uniqueName: c.uniquename,
    //           name: name,
    //           caption: name
    //         }]
    //       }
    //     }
    //   }

    // for (let r of drillOptions.rows) {
    //   let cLevelArr = r.level.split('.');
    //   let cLevelName = cLevelArr[cLevelArr.length - 1].replace(/[\[\]]/g, '');
    //
    //   let ch = this.helper.getHierarchy(r.hierarchy);
    //   if (ch) {
    //     console.log('dimensions:',this.dimensions);
    //     this.dimensions.forEach(d=>{
    //       if(d.name==r.dimension) {
    //         d.hierarchies.forEach(h=> {
    //           let index=h.levels.findIndex(l=>{
    //             return h.uniqueName == r.hierachy;
    //           });
    //
    //           // if (h.uniqueName == r.hierachy) {
    //           //   console.log('levels:',h.levels);
    //           //   if(h.levels.length>2){
    //           //     // h.levels[cLevelName].index;
    //           //   }
    //           // }
    //         })
    //       }
    //     })
    //     let meArr = r.uniquename.split('.');
    //     let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
    //     ch.levels[cLevelName].selection = {
    //       type: "INCLUSION",
    //       members: [{
    //         uniqueName: r.uniquename,
    //         name: name,
    //         caption: name
    //       }]
    //     };
    //     console.log('levels:',ch.levels);
    //     if(ch.levels.length>2){
    //       for(let key in ch.levels){
    //         if(key==cLevelName){
    //
    //         }
    //       }
    //     }
    //   }
    // }
    // this.helper.clearMeasures();
    // this.helper.setMeasures([drillOptions.measure]);
    // this.run.emit();
    // }

  }

  ngOnChanges(changes: SimpleChanges) {
    let chartTypeChange = changes["chartType"];
    let chartOptChange = changes['chartOpt'];
    let cardResultChange = changes["cardResult"];
    if (chartTypeChange || chartOptChange || cardResultChange) {
      this.options = this.barChart.options;
      setTimeout(() => {
        this.barChart.handleData(this.cardResult, this.chartType, this.chart, this.queryType);
      }, 40)

    }

  }

  changViewFn(x: number, y: number) {
    setTimeout(() => {
      this.barChart.changeView(x, y, this.chart);
    }, 40);
  }

  exportImgFn() {
    this.chart.exportChart();
  }
}
