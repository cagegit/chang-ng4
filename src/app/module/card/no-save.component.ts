/**
 * Created by fengjj on 2016/12/5.
 */
import { Component ,ViewChild,Input } from '@angular/core';
import {ModalDirective} from "ngx-bootstrap";
import {Router} from "@angular/router";
@Component({
  selector:'no-save',
  templateUrl:'./no-save.component.html',
  styleUrls:['./no-save.component.css']
})
export class NoSaveComponent {
  @ViewChild('noSaveModal') noSaveModal:ModalDirective;
  @Input() router:Router;
  dataSetID:string;
  queryType:string;
  showModal(curDataSetID:string,dataSetID:string,queryType:string){
    this.dataSetID=dataSetID;
    this.queryType=queryType;
    if(curDataSetID) {
      this.noSaveModal.show();
    }else{
      this.router.navigate(['/card',this.queryType,{id:this.dataSetID}]);
    }
  }
  closeModal(){
    this.noSaveModal.hide();
  }
  makeSure(){
    this.router.navigate(['/card',this.queryType,{id:this.dataSetID}]);
    this.noSaveModal.hide();
  }
}
