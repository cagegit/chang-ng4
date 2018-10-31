import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../app.notification";
import {DataSetService} from "../../common/service/data-set.service";
import {CardService} from "../../common/service/card.service";
import {TemplateHelper} from "./templateHelper";

@Component({
  templateUrl:'./card-update.component.html',
  styleUrls:['./card-update.component.css']
})
export class CardUpdateComponent implements OnInit{
  constructor(private route:ActivatedRoute, public router:Router, private appNotification:AppNotification,private dataSetServcie : DataSetService,private cardService : CardService){

  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      let id=params['id'];

      if(id){
        console.log("编辑报表!");
        let dataSetID = params['dataSetID'];
        console.log("默认数据集ID:",dataSetID);
      }else {
        let dataSetID = params['dataSetID'];
        console.log("默认数据集ID:",dataSetID);
        console.log("创建报表!");
        // console.log("默认数据集ID:",dataSetID);
      }
    });
    // this.cardService.executes(new TemplateHelper().model());
  }
}
