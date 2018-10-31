/**
 * Created by houxh on 2017-5-15.
 */
import {
  Component,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Renderer,
  ViewChild,
  ElementRef,
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/core";
import {ChartUtil} from "../../chart/chart.util";
import {flyIn} from "../../animations";
@Component({
  selector: 'change-showType',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './card.changeshow.component.html',
  styleUrls: ['./card.changeshow.component.css'],
  animations: [
    flyIn,
    trigger('toRightState', [
      state('inactive', style({
        transform: 'translateX(199px)'
      })),
      state('active', style({
        transform: 'translateX(0)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-in')),
    ])
  ]
})
export class CardChangeShowComponent implements OnChanges {
  @Input() chartUtil:ChartUtil;
  @Input() chartType:string;
  @Input() showType:string;
  @Input() iconType:string;
  @Input() toRightStateStr:string;
  @Input() dataChange:number;
  @Input() chartToolBarStatus:boolean;
  @Output() changeView = new EventEmitter<any>();
  @Output() changeActiveEmit=new EventEmitter<any>();
  @ViewChild('toRightBtn') toRightBtn:ElementRef;
  TabFlag = true;

  constructor(private renderer:Renderer) {

  }

  ngOnChanges(changes:SimpleChanges):void {
    let chartTypeChange = changes["chartType"];
    let showTypeChange = changes["showType"];
    let chartUtil=changes["chartUtil"];
    console.log("measureCount:",this.chartUtil.measureCount);
    if (chartTypeChange) {
      this.chartType = chartTypeChange.currentValue;
      this.loadShowMode(this.chartType);
    }
  }

  changeShowType(type:string, target:any) {
    let liNode = target['parentNode'];
    let nodes = Array.prototype.slice.call(liNode['parentNode'].getElementsByTagName('li'));
    for (let l of nodes) {
      this.renderer.setElementClass(l, 'cur', false);
    }
    this.loadShowMode(type);
    this.renderer.setElementClass(liNode, 'cur', true);
    this.showRightLayout();
  }

  showRightLayout() {
    let btnNode = this.toRightBtn.nativeElement;
    if (!btnNode.className.includes('icon-zhankai')) {
      this.changeRightFolderState();
    }
    this.changeView.emit({chartType: this.chartType, showType: this.showType, toRightStateStr: this.toRightStateStr});
  }

  changeRightFolderState() {
    let btnNode = this.toRightBtn.nativeElement;
    if (btnNode.className.includes('icon-zhankai')) {
      this.renderer.setElementClass(btnNode, 'icon-shouqi1', true);
      this.renderer.setElementClass(btnNode, 'icon-zhankai', false);
    } else {
      this.renderer.setElementClass(btnNode, 'icon-zhankai', true);
      this.renderer.setElementClass(btnNode, 'icon-shouqi1', false);
    }
    this.toRightStateStr = this.toRightStateStr === 'active' ? 'inactive' : 'active';
    this.changeActiveEmit.emit({isLeft:false,status: this.toRightStateStr});
  }

  changeTab(e:any, b:boolean) {
    let liNodes = Array.prototype.slice.call(e.target['parentNode'].getElementsByTagName('li'), 0)
    for (let liNode of liNodes) {
      this.renderer.setElementClass(liNode, 'cur', false);
    }
    this.renderer.setElementClass(e.target, 'cur', true);
    this.TabFlag = <boolean>b;
  }

  loadShowMode(type:string) {
    if (type.toLowerCase().indexOf('bar') >= 0) {
      this.iconType = 'bar';
    } else if (type.toLocaleLowerCase().indexOf('line') >= 0 || type.toLocaleLowerCase().indexOf('area') >= 0) {
      this.iconType = 'line';
    }
    else if (type.toLocaleLowerCase().indexOf('pie') >= 0) {
      this.iconType = 'pie';
    }
    else if (type == 'bubble' || type == 'scatter' || type == 'polar-spider' || type == 'mixChart' || type == 'heatMap') {
      this.iconType = 'more';
    }else if(type=='china-map'){
      this.iconType='map';
    }
    else {
      this.iconType = type;
    }
    if (type == 'table') {
      this.showType = 'table';
    } else if (type == 'txt') {
      this.showType = 'txt';
    } else {
      this.showType = 'chart';
      this.chartType = type;
    }

  }
}
