/**
 * Created by fengjj on 2017/3/10.
 */
import {Component, ViewChild, Output,EventEmitter} from '@angular/core'
import {ModalDirective} from "ngx-bootstrap";

@Component({
  selector:"data-set-alert",
  templateUrl: './data-set-alert.component.html',
  styleUrls: ['./data-set-alert.component.css']
})
export class DataSetAlertComponent {
  @ViewChild('alertModal') alertModal:ModalDirective;
  @Output() alertChange = new EventEmitter();
  args:string;

  alert(args: string){
    this.args=args;
    this.alertModal.show();
  }

  hide() {
    this.alertModal.hide()
  }

  ok(){
    this.alertChange.emit(this.args);
    this.alertModal.hide()
  }

}
