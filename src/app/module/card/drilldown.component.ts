/**
 * Created by houxh on 2017-1-6.
 */
import {Component, Input, ViewChild, Output, EventEmitter, Renderer} from "@angular/core";
import {TemplateHelper} from "./templateHelper";
import {Dimension} from "../../common/model/card/schema.dimension";
import {ModalDirective} from "ngx-bootstrap";
import {CardUtils} from "./card.utils";
import {Measure} from "../../common/model/card/card.query.template";
@Component({
  selector: 'drilldown',
  templateUrl: './drilldown.component.html',
  styleUrls: ['./drilldown.component.css']
})
export class DrilldownComponent {
  @ViewChild('drillDownBox') drillDownBox:ModalDirective;
  @Input() helper:TemplateHelper;
  @Input() dimensions:Dimension[];
  cardUtil:CardUtils = new CardUtils();
  showDim:Dimension[];
  selectDim:Array<any> = [];
  cols:Array<any> = [];
  rows:Array<any> = [];
  drillMeasure:Measure = new Measure();
  @Output() run = new EventEmitter<any>();

  constructor(private renderer:Renderer) {

  }

  showModal(options:any) {
    //dashboard下钻时使用
    if(!this.dimensions){
      this.dimensions=options.dimensions;
      this.helper=options.helper;
    }
    let newDims = this.cardUtil.deepCloneDim(this.dimensions);
    this.cols = options.cols;
    this.rows = options.rows;
    this.drillMeasure = options.measure;
    this.showDim = this.cardUtil.checkDrill(this.cols, newDims);
    this.showDim = this.cardUtil.checkDrill(this.rows, newDims);
    this.drillDownBox.show();
  }

  closeModal() {
    this.drillDownBox.hide();
  }

  changeCheckedState(e:Event, b:boolean) {
    let target = <any>e.target,
      parentLi = <HTMLElement>target.parentNode.parentNode.parentNode;
    this.renderer.setElementClass(parentLi, 'checked_bg', target.checked);
    if (b) {
      let inputNodes = parentLi.getElementsByTagName('input');
      for (let input of Array.from(inputNodes)) {
        input.checked = target.checked;
      }
    }
    let dim = parentLi.dataset['dimName'];
    let hierarchy = parentLi.dataset['hierarchy'];
    let hierarchyName = parentLi.dataset['hierarchyName'];
    let hierarchyCaption = parentLi.dataset['hierarchyCaption'];
    let index = parentLi.dataset['index'];
    if (target.checked) {
      this.showDim.forEach(d=> {
        if (d.name == dim) {
          for (let h of d.hierarchies) {
            if (h.uniqueName == hierarchy) {
              for (let l = 0; l < h.levels.length; l++) {
                if (l > 0 && l <= parseInt(index)) {
                  h.levels[l]['isdrill'] = true;
                } else {
                  h.levels[l]['isdrill'] = false;
                }
              }
            }
          }
        }

      })
      this.selectDim.push({
        dim: dim,
        hierarchy: hierarchy,
        hierarchyName: hierarchyName,
        hierarchyCaption: hierarchyCaption,
        index: parseInt(index)
      });

    } else {
      let dimIndex = this.selectDim.findIndex(d=> {
        if (d['dim'] == dim && d['hierarchy'] == hierarchy) {
          return true;
        }
      })
      this.showDim.forEach(d=> {
        if (d.name == dim) {
          for (let h of d.hierarchies) {
            if (h.uniqueName == hierarchy) {
              for (let l = 0; l < h.levels.length; l++) {
                if (l > 0 && l < parseInt(index)) {
                  h.levels[l]['isdrill'] = true;
                } else {
                  h.levels[l]['isdrill'] = false;
                }
              }
            }
          }
        }

      })
      if (dimIndex >= 0) {
        this.selectDim[dimIndex]['index'] = parseInt(index) - 1;
      }
      // this.selectDim.splice(dimIndex, 1);
    }
  }

  drillDown() {
    CardUtils.setDrillDownDimensions(this.selectDim,this.showDim,this.helper,this.cols,this.rows);
    this.helper.clearMeasures();
    this.helper.setMeasures([this.drillMeasure]);
    this.run.emit(this.helper);
    this.closeModal();
  }


  showChildHandle(e:MouseEvent) {
    let target = <any>e.target,
      parentLi = <HTMLElement>target.parentNode.parentNode;
    if (parentLi.className.indexOf('showChild') > -1) {
      this.renderer.setElementClass(parentLi, 'showChild', false);
    } else {
      this.renderer.setElementClass(parentLi, 'showChild', true);
    }
  }
}
