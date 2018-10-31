/**
 * Created by fengjj on 2017/3/22.
 */
import {Component, OnInit} from '@angular/core'
import {SIZES} from "../../common/size-in-documnet";
@Component({
  templateUrl: './invalid.component.html',
  styleUrls: ['./invalid.component.css']
})
export class InvalidComponent implements OnInit{
 public height:number;
  ngOnInit() {
    this.height = (document.documentElement.clientHeight || document.body.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT - SIZES.FOOT_HEIGHT;
  }
}

