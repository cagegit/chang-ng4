import { Component, OnInit,OnDestroy } from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import { TransferService } from '../transfer.service';

@Component({
  selector: 'app-dash-head',
  templateUrl: './dash-head.component.html',
  styleUrls: ['./dash-head.component.scss']
})
export class DashHeadComponent implements OnInit,OnDestroy {
  showMenuList =[];
  subscription : Subscription;
  constructor(private tranferSer: TransferService) { }

  ngOnInit() {
    this.subscription = this.tranferSer.transfer$.subscribe(data => {
          this.showMenuList = data;
    });
  }

  ngOnDestroy() {
     if(this.subscription) {
       this.subscription.unsubscribe();
     }
  }
}
