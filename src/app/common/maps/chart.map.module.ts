/**
 * Created by houxh on 2017-6-14.
 */
import {NgModule} from "@angular/core";
import { ChartModule } from 'angular2-highcharts';
import {ChartMapComponent} from "./chart.map.component";
@NgModule({
  imports: [
    ChartModule.forRoot(
      require('highcharts'),
      require('highcharts/modules/map')
    )

  ],
  declarations: [
    ChartMapComponent
  ],
  providers : [
  ],
  exports:[
    // ChartModule,
    ChartMapComponent
  ]
})
export default class ChartMapModule{
}
