/**
 * Created by fengjj on 2016/11/25.
 */
import {
  Component, Input, ElementRef, Renderer, AfterViewInit, ViewChild, Output, EventEmitter,
  OnChanges, SimpleChanges
} from '@angular/core';
import {Measure} from "../../../common/model/measure.model";
import {SchemaUtil} from "./schema-util";
@Component({
  selector:'edit-fact',
  template:`
            <div class="key_edit_layer" #layer >
              <form>
              <div class="layer_label"><label>原始字段</label><span>{{measure.fieldName}}</span></div>
              <div class="layer_label"><label>指标名称</label><span class="label_tip">(给指标指定在报表中显示的名称)</span></div>
              <div class="name_input"><input type="text" [(ngModel)]="measure.measureDisplayName" name="measure.measureDisplayName"></div>
              <div class="layer_label marT10"><label>聚合</label></div>
              <div class="layer_select">
                <select  [(ngModel)]="measure.aggregationType" name="measure.aggregationType">
                   <option *ngFor="let aggregationType of aggregationTypeArr" value="{{aggregationType}}" [selected]="aggregationType==measure.aggregationType">{{aggregationType}}</option>
                </select>
              </div>
              <div class="layer_label marT10"><label>格式化</label></div>
              <div class="layer_select">
                <select [(ngModel)]="measure.format" name="measure.format">
                   <option *ngFor="let format of formatArr" value="{{format}}" [selected]="format==measure.format">{{format}}</option>
                </select>
              </div>
              </form>
              <div class="layer_btn marT20 self_clearfix">
                <button class="self_btn self_right c_ef5350" (click)="submit()">确定</button>
                <button class="self_btn self_cancel self_right" (click)="cancel()">取消</button>
              </div>
            </div>

  `,
  styles:[`
  .key_edit_layer{ position: absolute; left: 0;top: 35px;border:1px solid #e3edf4;background-color: #fff;width: 330px; z-index: 10; padding:10px 20px 20px;text-align: left;}
.key_edit_layer:before,.key_edit_layer:after{ position: absolute; left:10px; top: -7px; border-bottom: 7px solid #e3edf4; border-right: 7px solid transparent; border-left: 7px solid transparent;border-top: none; content: ''; width: 0; height: 0; overflow: hidden; }
.key_edit_layer:after{ border-bottom-color: #fff;top: -5px;}
.layer_label{ line-height: 36px; color: #333;}
.layer_label label{ margin-right:20px; }
.label_tip{ color: #999;}
.name_input input,.layer_select select{ width: 100%; outline: none; padding: 0 10px; height: 26px; line-height: 24px; border:1px solid #e6eaec; border-radius: 3px; background-color: #f7f7f7; color: #666;}
.layer_btn button{height: 30px; line-height: 30px;width: 90px; margin-left:10px;font-size: 14px; }
  `]
})
export class EditFactCompnent implements AfterViewInit,OnChanges {
  @Input() position;
  @Input() measure : Measure;
  @ViewChild('layer') layer:ElementRef;
  @Output() measureChange = new EventEmitter<Measure>();
  aggregationTypeArr : string[]=[];
  formatArr : string[]=[]
  constructor(private render:Renderer) {
    for(let i in SchemaUtil.MEASURE_FORMAT){
      this.formatArr.push(SchemaUtil.MEASURE_FORMAT[i]);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("change:",changes);
    let positionChange=changes['position'];
    if(!positionChange.isFirstChange()){
      this.render.setElementStyle(this.layer.nativeElement,'left',this.position.left+'px');
      this.render.setElementStyle(this.layer.nativeElement,'top',this.position.top+'px');
    }


    let measure=changes['measure'].currentValue;
    console.warn("measure:",measure);
    this.aggregationTypeArr=SchemaUtil.MEASURE_AGGREGATIONTYPE_ARR(measure.schemaShowType);

  }


  ngAfterViewInit() {
    // console.log(this.layer)
    // console.log(this.position)
    console.info("measure:",this.measure);
    // this.render.setElementStyle(this.layer.nativeElement,'left',this.position.left+'px');
    // this.render.setElementStyle(this.layer.nativeElement,'top',this.position.top+'px');
    // this.render.setElementStyle(this.layer.nativeElement,'display','');
    console.log("ngAfterViewInit");
    this.render.setElementStyle(this.layer.nativeElement,'left',this.position.left+'px');
    this.render.setElementStyle(this.layer.nativeElement,'top',this.position.top+'px');
  }

  submit(){
    // console.log("修改:",this.measure.clone());
    this.measureChange.emit(JSON.parse(JSON.stringify(this.measure)));
  }

  cancel(){
    this.measureChange.emit(null);
  }
}
