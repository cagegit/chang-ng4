/**
 * Created by houxh on 2017-6-1.
 */
import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {QueryResult} from "../../common/model/card/query.model";
@Component({
  selector:'query-original',
  templateUrl:'./card.query.originalshow.component.html',
  styleUrls:['./card.query.originalshow.component.css']
})
export class QueryOriginalShowComponent implements OnChanges{
  @Input() cardResult:QueryResult;
@Input() page:number;
@Input() totalPage:number;
  ngOnChanges(changes: SimpleChanges): void {
   let resultChange=changes['cardResult'];
   if(resultChange&&!resultChange.isFirstChange()){
     this.cardResult=resultChange.currentValue;
   }
  }

}
