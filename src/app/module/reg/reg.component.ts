/**
 * Created by fengjj on 2016/9/19.
 */
import { Component ,OnInit} from '@angular/core';
import { RegService } from './reg.service';
import { Router ,ActivatedRoute } from '@angular/router'
import { AppContext } from "../../common/AppContext";

@Component({
  templateUrl:'./reg.component.html',
  styleUrls:['./reg.component.css']
})
export class RegComponent implements OnInit{
  constructor(public appContext: AppContext,public router: Router) {

  }

  ngOnInit(){
    if(this.appContext.isLoggedIn){
      this.router.navigate(['welcome']);
    }
  }
}
