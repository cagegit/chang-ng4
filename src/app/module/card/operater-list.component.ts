/**
 * Created by fengjj on 2016/12/18.
 */
import {
  Component,
  Renderer,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {Measure} from "../../common/model/card/schema.measure";
import {TemplateHelper} from "./templateHelper";
import {CardLimitComponent} from "./card.limit.component";

@Component({
  selector: 'operater-list',
  templateUrl: './operater-list.component.html',
  styleUrls: ['./operater-list.component.css']
})

export class OperaterListComponent implements OnInit {
  @ViewChild('operaterListBox') operaterListBox:ElementRef;
  @Input() top:number;
  @Input() left:number;
  @Input() measures:Measure[];
  @Input() helper:TemplateHelper;
  @Input() dimType:string;
  @Input() autoExecute:boolean;
  @Output() checkRun = new EventEmitter<any>();
  @Output() limitBoxEmit=new EventEmitter<any>();
@Input() showFlagList:any;
  constructor(private renderer:Renderer) {

  }

  menuObj = [
    {
      name: 'Limit',
      alias:'条数限制',
      value: [{name: 'Top 10',alias:'前十条', type: 'top', hasNext: false}
        , {name: 'Bottom 10', alias:'后十条',type: 'bottom', hasNext: false}
        , {name: 'Top 10 by...',alias:'前十条根据指标...', hasNext: true,children:this.measures}
        , {name: 'Bottom 10 by...', alias:'后十条根据指标...',hasNext: true,children:this.measures}
        , {name: 'Custom Limit...', alias:'自定义条数',type: 'warn',hasNext: false}
        , {name: '清除限制',alias:'清除限制', type: 'clear', hasNext: false}]
    }, {
      name: 'Sort',
      alias:'排序方式',
      value: [{name: 'Ascending',alias:'正序', type: 'ASC', hasNext: true,children:this.measures}
        , {name: 'Descending', alias:'倒序',type: 'DESC', hasNext: true,children:this.measures}
        , {name: 'Ascending(Breaking Hierarchy)',alias:'正序(忽略维度层级)', type: 'BASC', hasNext: true,children:this.measures}
        , {name: 'Descending(Breaking Hierarchy)', alias:'倒序(忽略维度层级)',type: 'BDESC', hasNext: true,children:this.measures}
        // , {name: 'Custom...', alias:'自定义',type: 'warn', hasNext: false}
        , {name: '清除排序',alias: '清除排序', type: 'clear', hasNext: false}]
    }, {
      name: 'Grand totals',
      alias:'汇总方式',
      value: [{name: 'None',alias: '无', type: 'clear', hasNext: false}
        , {name: 'Sum', alias: '求和',type: 'sum', hasNext: false}
        // , {name: 'Count', type: 'count', hasNext: false}
        , {name: 'Min',alias: '最小', type: 'min', hasNext: false}
        , {name: 'Max',alias: '最大', type: 'max', hasNext: false}
        , {name: 'Avg',alias: '平均', type: 'avg', hasNext: false}]
    }
    // , {name: '取消', value: []}
  ];

  ngOnInit() {
    this.renderer.setElementStyle(this.operaterListBox.nativeElement, 'top', `${this.top + 30}px`);
    // console.log('menuObj:',this.menuObj);
    // console.log('measures:',this.measures);
    for(let obj of this.menuObj){
          for (let child of obj.value) {
            if(child.hasNext){
              child['children']=this.measures;
            }
          }
    }
   this.checkSelected();
  }
checkSelected(){
  let section=this.helper.getAxis(this.dimType);
  if(section.filters.length>0){
    this.menuObj[0]['selected']=true;
    if(section.filters[0]['function']=='TopCount'){
      if(section.filters[0]['expressions'].length>1){
        this.menuObj[0].value[2]['selected']=true;
        let measure=section.filters[0]['expressions'][1];
        this.menuObj[0].value[2]['children']=this.setMenuSelected(measure);
      }else{
        this.menuObj[0].value[0]['selected']=true;
      }
    }else if(section.filters[0]['function']=='BottomCount'){
      if(section.filters[0]['expressions'].length>1){
        this.menuObj[0].value[3]['selected']=true;
        let measure=section.filters[0]['expressions'][1];
        this.menuObj[0].value[3]['children']=this.setMenuSelected(measure);
      }else{
        this.menuObj[0].value[1]['selected']=true;
      }
    }
  }else{
    this.menuObj[0]['selected']=false;
  }
  if(section.sortOrder){
    this.menuObj[1]['selected']=true;
    if(section.sortOrder=='ASC'){
      this.menuObj[1].value[0]['selected']=true;
      let measure=section.sortEvaluationLiteral;
      this.menuObj[1].value[0]['children']=this.setMenuSelected(measure);
    }else if(section.sortOrder=='DESC'){
      this.menuObj[1].value[1]['selected']=true;
      let measure=section.sortEvaluationLiteral;
      this.menuObj[1].value[1]['children']=this.setMenuSelected(measure);
    }else if(section.sortOrder=='BASC'){
      this.menuObj[1].value[2]['selected']=true;
      let measure=section.sortEvaluationLiteral;
      this.menuObj[1].value[2]['children']=this.setMenuSelected(measure);
    }else if(section.sortOrder=='BDESC'){
      this.menuObj[1].value[3]['selected']=true;
      let measure=section.sortEvaluationLiteral;
      this.menuObj[1].value[3]['children']=this.setMenuSelected(measure);
    }
  }else{
    this.menuObj[1]['selected']=false;
  }
  let agg= this.menuObj[2];
  if(section.hasOwnProperty('aggs')&&section['aggs'].length>0){
    agg['selected']=true;
    if(section['aggs'][0]=='sum'){
      agg.value[1]['selected']=true;
    // }else if(section['aggs'][0]=='count'){
    //   agg.value[2]['selected']=true;
    }else if(section['aggs'][0]=='min'){
      agg.value[2]['selected']=true;
    }else if(section['aggs'][0]=='max'){
      agg.value[3]['selected']=true;
    }else if(section['aggs'][0]=='avg'){
      agg.value[4]['selected']=true;
    }else{
      agg.value[0]['selected']=true;
    }
  }else{
    agg['selected']=false;
  }
}
  setMenuSelected(key:string):Measure[]{
    let curMeasures=[];
    for(let m of this.measures){
      let newM=new Measure;
      for(let i in m){
        newM[i]=m[i];
      }
      if(newM.uniqueName==key){
        newM['selected']=true;
      }
      curMeasures.push(newM);
    }
   return curMeasures;
  }
  addSort(sortMeasure:string, sortOrder:string) {
    let section = this.helper.getAxis(this.dimType);
    section['sortEvaluationLiteral'] = sortMeasure;
    section['sortOrder'] = sortOrder;
    if (this.autoExecute) {
      this.checkRun.emit();
    }
  }

  addAggregators(calculate:string) {
    let section = this.helper.getAxis(this.dimType);
    let aggregators = [calculate];
    section['aggs'] = aggregators;
    if (this.autoExecute) {
      this.checkRun.emit();
    }
  }

  addLimit(e:any) {
    let current = e.target;
    let parentName = current.dataset.parentName;
    this.showFlagList.showOperaterBoxFlag=false;
    let type = current.dataset.type;
    if (parentName.indexOf(',') > 0) {
      let parents = parentName.split(',');
      let uniqueName = current.dataset.uniqueName;
      if (parents[0] == 'Limit') {
        let strArr = parents[1].split(' ');
        this.optLimit(parseInt(strArr[1]), strArr[0] + 'Count', uniqueName);
      } else if (parents[0] == 'Sort') {
        this.addSort(uniqueName, type);
      }
    } else {
      let self = current.dataset.self;
      let hasNext = current.dataset.hasnext;
      if (hasNext=='false') {
        if (type != 'warn' && type != 'clear') {
          let strArr = self.split(' ');
          if (parentName == 'Limit') {
            if (self != '')
              this.optLimit(parseInt(strArr[1]), strArr[0] + 'Count', '');
          } else if (parentName == 'Grand totals') {
            this.addAggregators(self.toLowerCase());
          }
        } else if (type == 'clear') {
          let section = this.helper.getAxis(this.dimType);
          if (parentName == 'Limit') {
            section.filters = [];
          }else if (parentName == 'Sort') {
            section['sortEvaluationLiteral'] = null;
            section['sortOrder'] = null;
          } else if (parentName == 'Grand totals') {
            section['aggs'] = [];
          }
          if (this.autoExecute) {
            this.checkRun.emit();
          }
        } else if (type == 'warn') {
          this.limitBoxEmit.emit();
          // alert('请设计弹框操作');
        }
      }


    }

  }

  optLimit(count:number, limitType:string, expression:string) {
    let section = this.helper.getAxis(this.dimType);
    //
    let obj = {
      expressions: [],
      flavour: "N",
      'function': "",
      operator: null
    }
    if (expression) {
      obj.expressions = [count, expression];
    } else {
      obj.expressions = [count];
    }
    obj.function = limitType;
    section['filters'] = [obj];
    if (this.autoExecute) {
      this.checkRun.emit();
    }
  }

  onClickHandle(e:MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
}
