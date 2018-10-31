/**
 * Created by houxh on 2017-3-27.
 */
import {NgModule} from "@angular/core";
import { ChartModule } from 'angular2-highcharts';
import {ChartHighChartComponent} from "./chart.highchart.component";
@NgModule({
  imports: [
    ChartModule.forRoot(
      require('highcharts'),
      require('highcharts/modules/heatmap'),
      require('highcharts/highcharts-more'),
      require('highcharts/modules/exporting')
    )
  ],
  declarations: [
    ChartHighChartComponent
  ],
  providers : [
  ],
  exports:[
    ChartModule,
    ChartHighChartComponent
  ]
})
export default class ChartHighChartModule{

}
