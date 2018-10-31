import { Component } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CardService} from "../../../common/service/card.service";
import {Card} from "../../../common/model/card/card.model";
import {AppNotification} from "../../../app.notification";

@Component({
  selector : 'data-set-card-list',
  templateUrl:'./data-set-card-list.component.html',
  styleUrls:['./data-set-card-list.component.css']
})
export class DataSetCardListComponent {
  nextText = `<i class="iconfont icon-jiantou-copy"></i>`;
  previousText = `<i class="iconfont icon-jiantouy-copy"></i>`;
  cards:Card[]=new Array<Card>();
  dataSetId:string;
  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification,private cardService:CardService){
  }
  getCards(dataSetId:string){
    this.cardService.getCards(dataSetId).subscribe(rep=>{
       this.cards=rep;
    })
  }
  ngOnInit(){
    this.route.params.subscribe((params) => {
      let id=params['id'];
      this.dataSetId=id;
       this.getCards(id);
      console.log(id);
    })
  }
}

