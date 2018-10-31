import {Component, OnInit, AfterViewInit, ViewChild} from "@angular/core";
import {AppNotification} from "../../../app.notification";
import {DataSourceService} from "../../../common/service/data-source.service";
import {Router} from "@angular/router";
import {ModalDirective} from "ng2-bootstrap";
import {CFG} from "../../../common/CFG";
@Component({
  selector:'data-source-add-modal',
  templateUrl: './data-source-add.component.html',
  styleUrls:['../data-center.component.scss']
})
export class DataSourceAddModalComponent implements OnInit {
  @ViewChild('dataSourceAddModal') dataSourceAddModal:ModalDirective;
  selectSourceType : string='mysql';
  DISPLAY_SWITCH_ISOURCE : string=CFG.DISPLAY_SWITCH.ISOURCE;
  constructor(public router:Router,private dataSourceService : DataSourceService, private appNotification : AppNotification){

  }

  ngOnInit(){
  }

  show(){
    this.dataSourceAddModal.show();
  }
  
  selectAddDataSource(){
    this.router.navigate([`/chang/source/update/${this.selectSourceType}`]);
  }
}
