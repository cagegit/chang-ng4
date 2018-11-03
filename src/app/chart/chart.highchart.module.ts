/**
 * Created by houxh on 2017-3-27.
 */
import {NgModule} from "@angular/core";
import { ChartModule } from 'angular2-highcharts';
import {ChartHighChartComponent} from "./chart.highchart.component";
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  const ee =  require('highcharts/modules/heatmap');
  const ff =   require('highcharts/highcharts-more');
  const gg =   require('highcharts/modules/exporting');
  dd(hc);
  ee(hc);
  ff(hc);
  gg(hc);
  return hc;
}
@NgModule({
  imports: [
    ChartModule
  ],
  declarations: [
    ChartHighChartComponent
  ],
  providers : [
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    }
  ],
  exports:[
    ChartModule,
    ChartHighChartComponent
  ]
})
export class ChartHighChartModule{

}
