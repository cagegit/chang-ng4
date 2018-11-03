import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../app.notification";

import {Measure} from "../../common/model/card/schema.measure";
import {Dimension} from "../../common/model/card/schema.dimension";
import {MetaData} from "../../common/model/card/schema.metadata";
import {Cube} from "../../common/model/card/schema.cube";
import {HashMap} from "../../common/model/card/card.query.template";
import {Loading} from "../../common/loading.mask.util";
import {ChartUtil} from "../../chart/chart.util";
import {flyIn} from '../../animations'
import {OlapComponent} from './card.olap.component';
import {QueryComponent} from "./card.query.component";
@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  providers:[ChartUtil],
  animations: [
    flyIn,
    trigger('centerToLeftState', [
      state('inactive', style({
        'padding-left': '30px'
      })),
      state('active', style({
        'padding-left': '177px'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-in')),
    ])
  ]
})
export class CardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('leftContent') leftContent: ElementRef;
  @ViewChild('toLeftBtn') toLeftBtn: ElementRef;
  @ViewChild('toRightBtn') toRightBtn: ElementRef;
  @ViewChild('saikuBox') saikuBox: ElementRef;

  @ViewChild('saikuContainerBox') saikuContainerBox: ElementRef;
  @ViewChild('olapCom') olapCom: OlapComponent;
  @ViewChild('queryCom') queryCom: QueryComponent;

  showFlagList = {
    showDatasetListFlag: false,
    editFilterFlag: false,
    showDownloadFlag: false,
    showOperaterBoxFlag: false
  }
  showSql = false;
  hasviewChecked = false;
  toRightStateStr = 'inactive';
  toLeftStateStr = 'active';

  cardId: string;
  measureGroup: Set<string>;
  measures: Measure[];
  dimensions: Dimension[];
  validCube: Cube;
  dataSetID: string;
  queryType: string;
  //所有metaData集合
  metaDataMap = new HashMap<string, MetaData>();
  //展示数据时的方式
  showType: string = 'table';
  chartType: string;
  iconType: string = 'bar';
  // chart:any;
  barChart = this.chartUtil;
  dataSourceCount: number;
  dataChange:number;
  chartToolBarStatus:boolean=true;
  constructor(private route: ActivatedRoute, public router: Router, private appNotification: AppNotification, private renderer: Renderer2, private chartUtil:ChartUtil) {

  }

  ngAfterViewInit() {
    // this.resizeHandle();
  }

  /**
   * olap 指标设置
   * @param item
   */
  addMeasureFn(item: Measure) {
    this.olapCom.addMeasure(item);
  }

  /**
   * olap 维度设置
   * @param axisName
   * @param hierarchy
   * @param hierarchyCaption
   * @param levelName
   * @param levelCaption
   * @param dimensionName
   * @param levelIndex
   */
  addDimensionFn({axisName, hierarchy, hierarchyCaption, levelName, levelCaption, dimensionName, levelIndex}) {
    this.olapCom.addDimension(axisName, hierarchy, hierarchyCaption, levelName, levelCaption, dimensionName, levelIndex);
  }

  /**
   * olap MetaData设置
   * @param metaDataMap
   * @param dimensions
   * @param measures
   * @param validCube
   */
  setMetaDataFn({metaDataMap, dimensions, measures, validCube,measureGroup}) {
    this.metaDataMap = metaDataMap;
    this.dimensions = dimensions;
    this.measures = measures;
    this.validCube = validCube;
    this.measureGroup=measureGroup;
  }

  updateDataSourceCountFn(count: number) {
    this.dataSourceCount = count;
  }

  changeQueryTypeFn(type: string) {
    // if (!this.cardId) {
      //创建
      if (type == 'SQL') {
        this.router.navigate(['/card', 'SQL', {id:this.dataSetID}]);
      } else {
        this.router.navigate(['/card', 'OLAP', {id:this.dataSetID}]);
      }
    // } else {
    //   //编辑
    //   if (type == 'SQL') {
    //     this.router.navigate(['/card', 'SQL', {id:this.dataSetID,cardId: this.cardId}]);
    //   } else {
    //     this.router.navigate(['/card', 'OLAP', {id:this.dataSetID,cardId: this.cardId}]);
    //   }
    // }
  }

  /**
   * 修改左/右侧展开状态
   * @param isLeft
   * @param status
   */
  changeActiveFn({isLeft, status}) {
    if (isLeft) {
      this.toLeftStateStr = status;
    } else {
      this.toRightStateStr = status;
    }
  }
changeShowTypeFn({showType,chartType}){
    this.showType=showType;
    this.chartType=chartType;
}
  ngOnInit() {
    this.route.params.subscribe(params => {
      let queryType = params['queryType'];
      console.log(queryType);
      if(queryType=='SQL'){
        this.chartToolBarStatus=false;
        this.toRightStateStr='inactive'
      }else{
        this.chartToolBarStatus=true;
      }
      this.barChart= this.chartUtil;
      this.queryType = queryType;
      //为了切换dataset，刷新model end
      let id = params['id'];
      this.dataSetID = id;
      this.showType= 'table';
      this.chartType='table';
      this.iconType = 'bar';
      this.dataChange = new Date().getTime();
      this.cardId=params['cardId'];
      // let curRoute = this.route;
      // curRoute.queryParams.subscribe(qp => {
      //   let cardId = qp['cardId'];
      //   this.cardId = cardId;
      // })

    });
  }

  changeFolderState(e: any, changeClassName: string, curClassName: string) {
    let node = e.target;
    if (node.className.indexOf(curClassName) === -1) {
      node = node.parentNode;
    }
    if (node.className.indexOf(changeClassName) > -1) {
      this.renderer.removeClass(node, changeClassName);
    } else {
      this.renderer.addClass(node, changeClassName);
    }
  }
changeRightChartBarFn(status:boolean){
    this.chartToolBarStatus=status;
}
  showDatasetList(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.hiddenOtherLayers('showDatasetListFlag')
    //let node:any = e.target;
    //
    //node = e.target.className.indexOf('self_clearfix') > -1 ? node : node.parentNode;
    //this.renderer.setElementClass(node, 'show_dataset', true);
  }

  changeLeftFolderState() {
    let btnNode = this.toLeftBtn.nativeElement;
    if (btnNode.className.includes('icon-shouqi1')) {
      this.toLeftStateStr = 'inactive';
      this.renderer.removeClass(btnNode, 'icon-shouqi1');
      this.renderer.addClass(btnNode, 'icon-zhankai');
      setTimeout(() => {
        this.renderer.setStyle(this.leftContent.nativeElement, 'display', 'none');
      }, 100)
    } else {
      this.toLeftStateStr = 'active';
      this.renderer.setStyle(this.leftContent.nativeElement, 'display', 'block');
      this.renderer.addClass(btnNode, 'icon-shouqi1');
      this.renderer.removeClass(btnNode, 'icon-zhankai');
    }
    // setTimeout(() => {
    this.changeSvgView();
    // }, 40)
  }

  changeSvgView(changeOption?: any) {
    if (changeOption) {
      this.chartType = changeOption['chartType'];
      this.showType = changeOption['showType'];
      this.toRightStateStr = changeOption['toRightStateStr'];
    }
  }

  fullScreenFn(height: number) {
    this.renderer.setStyle(this.saikuContainerBox.nativeElement, 'height', `${height}px`);
  }

  addTableFn(tableName: string) {
    this.queryCom.addTextToEdit(tableName);
  }

  addFieldFn(fieldName: string) {
    this.queryCom.addTextToEdit(fieldName);
  }

  private hiddenOtherLayers(property: string) {
    for (let p in this.showFlagList) {
      if (p == property) {
        this.showFlagList[p] = true;
      } else {
        this.showFlagList[p] = false;
      }
    }
  }

  ngOnDestroy(): void {
    Loading.removeLoading();
  }

  private computeMarkHeight() {
    // this.markHeight = Math.round((this.screenHeight - this.headerHeight - this.footerHeight - 39 - 39 - 39 - 27 - 40) / 2);
    // console.log('markHeight', this.markHeight)
  }
}
