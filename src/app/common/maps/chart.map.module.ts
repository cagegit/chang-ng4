/**
 * Created by houxh on 2017-6-14.
 */
import {NgModule} from "@angular/core";
import { ChartModule } from 'angular2-highcharts';
import {ChartMapComponent} from "./chart.map.component";
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts');
  const dd =require('highcharts/modules/map');
  dd(hc);
  return hc;
}
@NgModule({
  imports: [
    ChartModule
  ],
  declarations: [
    ChartMapComponent
  ],
  providers : [
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    }
  ],
  exports:[
    // ChartModule,
    ChartMapComponent
  ]
})
export class ChartMapModule{
}
