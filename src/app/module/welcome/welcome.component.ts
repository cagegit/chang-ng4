/**
 * Created by fengjj on 2017/6/8.
 */
import { Component } from '@angular/core'
import {AppContext} from "../../common/AppContext";
@Component({
  styleUrls:['./welcome.component.css'],
  templateUrl:'./welcome.component.html'
})
export class WelcomeComponent {

    constructor(public appContext : AppContext){
      console.log(appContext);

    }
}
