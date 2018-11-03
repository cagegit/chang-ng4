/**
 * Created by fengjj on 2017/1/9.
 */
import {
  Component, ViewChild, Renderer, EventEmitter, Input, Output} from '@angular/core';
import {ModalDirective} from "ngx-bootstrap";
import {TemplateHelper} from "./templateHelper";
import {Dimension, Level} from "../../common/model/card/schema.dimension";
import {CardUtils} from "./card.utils";
import {Measure} from "../../common/model/card/schema.measure";
import * as query from "../../common/model/card/card.query.template";
@Component({
  selector: 'section-dimension',
  templateUrl: './section-dimension.component.html',
  styleUrls: ['./section-dimension.component.css']
})
//section-dimension.component
export class SectionDimensionComponent{

  @ViewChild('sectionDomension') sectionDomension:ModalDirective;
  @Input() helper:TemplateHelper;
  @Input() dimensions:Dimension[];
  @Input() measures:Measure[];
  @Input() measureGroup:Set<string>;
  // newDims:Dimension[];
  cardUtil:CardUtils = new CardUtils();
  showDim:Dimension[];
  selectDims:Array<SelectDimension> = [];
  showMeasures:Measure[];
  selectMeasures:Array<query.Measure> = [];
  cols:Array<any> = [];
  rows:Array<any> = [];
  drillMeasure:query.Measure = new query.Measure();
  @Output() run = new EventEmitter<any>();

  constructor(private renderer:Renderer) {

  }

  show(options:any) {
console.log('group:',this.measureGroup);
    //dashboard切片时使用
    if(!this.dimensions){
      this.dimensions=options.dimensions;
      this.helper=options.helper;
      // this.measureGroup=options.measureGroup;
      this.measures=options.measures;
    }
    this.selectDims=[];
    let newDims = this.cardUtil.deepCloneDim(this.dimensions);
    let newMeasures=this.cardUtil.deepCloneMeasure(this.measures);
    this.cols = options.cols;
    this.rows = options.rows;
    this.drillMeasure = options.measure;
    this.showDim = this.cardUtil.checkSection(this.cols, newDims);
    this.showDim = this.cardUtil.checkSection(this.rows, newDims);
    this.showMeasures=this.cardUtil.checkSectionMeasures(this.drillMeasure,newMeasures);
    this.sectionDomension.show();
  }

  hide() {
    this.sectionDomension.hide();
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
      if (parentLi.dataset['from'] == 'dimension') {
        this.checkDimensionHierarchy(target);
      }
    } else {
      if (parentLi.dataset['from'] == 'dimension') {
        this.checkDimensionLevel(target);
      } else if (parentLi.dataset['from'] == 'measure') {
        this.checkMeasures(target);
      }
    }

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

  checkDimensionHierarchy(target:any) {
    let parentLi = <HTMLElement>target.parentNode.parentNode.parentNode;
    let dimensionName = parentLi.dataset['dimName'];
    let hierarchyName = parentLi.dataset['hierarchyName'];
    let levels = new Array<Level>();
    if (target.checked) {
      this.showDim.forEach(d=> {
        if (d.name == dimensionName) {
          d.hierarchies.forEach(h=> {
            if (h.name == hierarchyName) {
              for (let i = 0; i < h.levels.length; i++) {
                if (i > 0) {
                  let sd = new SelectDimension();
                  sd.dim = d.name;
                  sd.hierarchy = h.uniqueName;
                  sd.hierarchyName = hierarchyName;
                  sd.hierarchyCaption = h.caption;
                  sd.index = i;
                  this.selectDims.push(sd);
                }

              }
            }
          })
        }
      })
    } else {

      let newSelectDims = new Array<SelectDimension>();
      this.selectDims.forEach(sd=> {
        if (sd.dim == dimensionName && sd.hierarchyName == hierarchyName) {

        } else {
          newSelectDims.push(sd);
        }
      });
      this.selectDims = newSelectDims;
    }
  }
  //检测level选中状态
  checkDimensionLevel(target:any) {
    let parentLi = <HTMLElement>target.parentNode.parentNode.parentNode;
    let dim = parentLi.dataset['dimName'];
    let hierarchy = parentLi.dataset['hierarchy'];
    let hierarchyName = parentLi.dataset['hierarchyName'];
    let hierarchyCaption = parentLi.dataset['hierarchyCaption'];
    let index = parentLi.dataset['index'];
    if (target.checked) {
      let sd = new SelectDimension();
      sd.dim = dim;
      sd.hierarchy = hierarchy;
      sd.hierarchyName = hierarchyName;
      sd.hierarchyCaption = hierarchyCaption;
      sd.index = parseInt(index);
      this.selectDims.push(sd);
      //设置level选中状态
      this.showDim.forEach(d=> {
        if (d.name == dim) {
          d.hierarchies.forEach(h=> {
            if (h.name == hierarchyName) {
              for (let i = 0; i < h.levels.length; i++) {
                if (i>0&&i<=parseInt(index)) {
                  h.levels[i]['isSection']=true;
                }
              }
            }
          })
        }
      })
    } else {
      //取消level选中状态
      this.showDim.forEach(d=> {
        if (d.name == dim) {
          d.hierarchies.forEach(h=> {
            if (h.name == hierarchyName) {
              for (let i = 0; i < h.levels.length; i++) {
                if (i>=parseInt(index)) {
                  h.levels[i]['isSection']=false;
                }
              }
            }
          })
        }
      })
      let dimIndex = this.selectDims.findIndex(d=> {
        if (d.dim == dim && d.hierarchy == hierarchy && d.index == parseInt(index)) {
          return true;
        }
      })
      this.selectDims.splice(dimIndex, 1);
    }
  }

  checkMeasures(target:any) {
    let parentLi = <HTMLElement><HTMLElement>target.parentNode.parentNode.parentNode;
    let measureName = parentLi.dataset['measureName'];
    let measureUnique = parentLi.dataset['measureUnique'];
    let measureCaption=parentLi.dataset['measureCaption'];
    if (target.checked) {
      let m = new query.Measure();
      m.name = measureName;
      m.caption = measureCaption;
      m.uniqueName = measureUnique;
      m.type = "EXACT";
      this.selectMeasures.push(m);
    } else {
      let index = this.selectMeasures.findIndex(m=> {
        if (m.name == measureName && m.uniqueName == measureUnique) {
          return true;
        }
      });
      this.selectMeasures.splice(index, 1);
    }
  }
  //触发切片操作
  slice() {
    this.helper.clearMeasures();
    if (this.selectMeasures.length > 0) {
      this.selectMeasures.push(this.drillMeasure);
      this.helper.setMeasures(this.selectMeasures);
    } else {
      this.helper.setMeasures([this.drillMeasure]);
    }

    this.operateintroductionData();
    if (this.selectDims.length > 0) {
      this.operateSelectDimensions();
    }
    this.run.emit(this.helper);
    this.hide();
  }

  operateintroductionData() {
    for (let r of this.rows) {
      let hasR = this.selectDims.findIndex(s=> {
        if (s.hierarchy == r.hierarchy)
          return true;
      });
      if (hasR < 0) {
        let ch = this.helper.getHierarchy(r.hierarchy);
        if(ch) {
          let level = this.getLevelFromDimensionsByLevelUniqueName(r);
          if (level) {
            let meArr = r.uniquename.split('.');
            let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
            ch.levels[level.name]['selection'] = {
              type: "INCLUSION",
              members: [{
                uniqueName: r.uniquename,
                name: name,
                caption: name
              }]
            };
          }
          //删除原来row中的维度，并把row中的维度转移到filter中
          this.helper.removeHierarchy(r.hierarchy);
          this.helper.changeSectionHierarchy("FILTER", ch);
        }
      }
    }
    for (let c of this.cols) {
      let hasC = this.selectDims.findIndex(s=> {
        if (s.dim == c.dimension)
          return true;
      });
      if (hasC < 0) {
        let ch = this.helper.getHierarchy(c.hierarchy);
        if (ch) {
          let level = this.getLevelFromDimensionsByLevelUniqueName(c);
          if (level) {
            let meArr = c.uniquename.split('.');
            let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
            ch.levels[level.name]['selection'] = {
              type: "INCLUSION",
              members: [{
                uniqueName: c.uniquename,
                name: name,
                caption: name
              }]
            };
          }
          //删除原来column中的维度，并把column中的维度转移到filter中
          this.helper.removeHierarchy(c.hierarchy);
          this.helper.changeSectionHierarchy("FILTER", ch);
        }
      }
    }

  }

  getLevelFromDimensionsByLevelUniqueName(obj:any):Level {
    for (let dim of this.dimensions) {
      if (dim.name == obj.dimension) {
        for (let h of dim.hierarchies) {
          if (h.uniqueName == obj.hierarchy) {
            for (let l of h.levels) {
              if (l.uniqueName == obj.level) {
                return l;
              }
            }
          }
        }
      }
    }
    return null;
  }

  operateSelectDimensions() {
    for (let d of this.selectDims) {
      let hierarchyName = d.hierarchy;
      let levels = new Array<Level>();
      for (let dim of this.dimensions) {
        if (dim.name == d['dim']) {
          for (let h of dim.hierarchies) {
            if (h.uniqueName == d['hierarchy']) {
              for (let l = 0; l < h.levels.length; l++) {
                if (l > 0 && l <= d['index']) {
                  let lin = levels.findIndex(lv=> {
                    if (lv.name == h.levels[l].name)
                      return true;
                  })
                  if (lin < 0)
                    levels.push(h.levels[l]);
                }
              }
            }
          }
        }
      }
      for (let l of levels) {
        this.helper.includeLevel('ROWS', hierarchyName, d.hierarchyCaption, l.name, l.caption, d.dim, d.index);
      }
    }
  }
}
export class SelectDimension {
  dim:string;
  hierarchy:string;
  hierarchyName:string;
  hierarchyCaption:string;
  index:number;
}
