/**
 * Created by fengjj on 2016/11/7.
 */
import { Component ,OnInit ,Input ,ViewChild ,AfterViewInit ,Output ,EventEmitter } from '@angular/core';
import {ModalDirective} from "ng2-bootstrap";
@Component({
  selector:'show-data',
  templateUrl: './show-data.component.html',
  styleUrls: ['../data-center.component.scss']
})
export class ShowDataComponent implements OnInit ,AfterViewInit {
  @Input() tablePreViewData:string;
  @ViewChild('showData') showData:ModalDirective;
  @Output() closeModal = new EventEmitter();
  ngOnInit() {
  }
  ngAfterViewInit() {
    this.showData.show();
  }
  closeHandle() {
    this.showData.hide();
    this.closeModal.next();
  }
}
