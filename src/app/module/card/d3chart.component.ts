/**
 * Created by houxh on 2017-1-5.
 */
import {Component,Input,OnChanges,SimpleChanges} from '@angular/core';
import {ShowChart} from "./card.showchart";
@Component({
  selector: 'd3chart',
  templateUrl:'./d3chart.component.html'
})
export class D3ChartComponent implements OnChanges{
  @Input() chartOpt:any;
  @Input() chartType:string;
  options:any;
  chart:any;
  ngOnChanges(changes: SimpleChanges){
    let chartTypeChange=changes["chartType"];
    if(!chartTypeChange.isFirstChange()){
      this.chartType=chartTypeChange.currentValue;
      this.options=this.chartOpt.options;
    }
    let chartOptChange=changes['chartOpt'];
    if(chartOptChange){
      this.chartOpt=chartOptChange.currentValue;
      this.options=this.chartOpt.options;
    }
  }
}
