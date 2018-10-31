/**
 * Created by houxh on 2017-6-28.
 */
import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";
import {TemplateHelper} from "./templateHelper";
import {Measure} from "../../common/model/card/schema.measure";
import {AppNotification} from "../../app.notification";
@Component({
  selector: 'card-limit',
  templateUrl: './card.limit.component.html',
  styleUrls: ['./card.limit.component.css']
})
export class CardLimitComponent {
  @Input() autoExecute: boolean;
  @Input() measures: Measure[];
  @Input() helper: TemplateHelper;
  @Input() dimType: string;
  @Output() checkRun = new EventEmitter<any>();
  @ViewChild('setLimitBox') setLimitBox: ModalDirective;
  showNumber: number;
  limitType: string;
  measureUnique: string;
  functions: any;

  constructor(private appNotification: AppNotification) {
    this.functions = [{name: 'TopCount', checked: false},
      {name: 'TopPercent', checked: false},
      {name: 'TopSum', checked: false},
      {name: 'BottomCount', checked: false},
      {name: 'BottomPercent', checked: false},
      {name: 'BottomSum', checked: false}
    ];
  }

  show() {
    console.log('func:', this.functions);
    // this.showNumber=num;
    let axes = this.helper.getAxis(this.dimType);
    if (axes.filters.length > 0) {
      this.limitType = axes.filters[0].function;
      this.measureUnique = axes.filters[0].expressions[1];
      this.showNumber = axes.filters[0].expressions[0];
      this.functions.forEach((funs: any) => {
        if (funs.name == this.limitType) {
          funs.checked = true;
        }
      })
      this.measures.forEach((m) => {
        if (m.uniqueName == this.measureUnique) {
          m['checked'] = true;
        } else {
          m['checked'] = false;
        }
      })
    }
    this.setLimitBox.show();
  }

  closeModal() {
    this.setLimitBox.hide();
  }

  changeNumber(e: any) {
    let num = e.target.value;
    if (!num || isNaN(num)) {
      return;
    }
    this.showNumber = Math.abs(num);
  }

  save(e: any) {
    if (!this.showNumber || this.showNumber <= 0) {
      this.appNotification.error("临界值不能为空");
      return;
    }
    let section = this.helper.getAxis(this.dimType);
    let funcs = document.getElementById('funcs');
    let index = funcs['selectedIndex'];
    let funcName = funcs['options'][index].value;
    let measure = document.getElementById('measures');
    let mIndex = measure['selectedIndex'];
    let measureName = measure['options'][mIndex].value;
    console.log('names:', funcName, measureName);
    let obj = {
      expressions: [],
      flavour: "N",
      'function': "",
      operator: null
    }
    // if (this.measureUnique) {
    //   obj.expressions = [this.showNumber, measureName];
    // } else {
    //   obj.expressions = [this.showNumber];
    // }
    obj.expressions = [this.showNumber, measureName];
    obj.function = funcName;
    section['filters'] = [obj];
    if (this.autoExecute) {
      this.checkRun.emit();
    }
    this.setLimitBox.hide();
  }
}
