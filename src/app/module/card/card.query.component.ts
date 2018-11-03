/**
 * Created by houxh on 2017-5-22.
 */
import {
  animate,
  Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer, SimpleChanges, state, style, transition,
  trigger,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {Location} from "@angular/common";
import {CardService} from "../../common/service/card.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppNotification} from "../../app.notification";
import {Subject} from "rxjs/Subject";
import {ChartUtil} from "../../chart/chart.util";
import {Card} from "../../common/model/card/card.model";
import {Md5} from "ts-md5/dist/md5";
import {QueryInfo, QueryResult, QueryResultInfo, chartOptions} from "../../common/model/card/query.model";
import {ConfirmComponent} from "../common/confirm.component";
import {Loading} from "../../common/loading.mask.util";
import {Error} from "../../common/model/Error"
import {flyIn} from "../../animations";
import {QueryPrettyShowComponent} from "./card.query.prettyshow.component";
import { DataHandleService } from '../../changan/data.handle.service';
declare var ace: any;
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'query-com',
  templateUrl: './card.query.component.html',
  styleUrls: ['./card.query.component.css'],
  animations: [
    flyIn,
    trigger('centerToRightState', [
      state('inactive', style({
        'padding-right': '40px'
      })),
      state('active', style({
        'padding-right': '239px'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-in')),
    ]),
    // trigger('toLeftState', [
    //   state('inactive', style({
    //     transform: 'translateX(-147px)'
    //   })),
    //   state('active', style({
    //     transform: 'translateX(0)'
    //   })),
    //   transition('inactive => active', animate('100ms ease-in')),
    //   transition('active => inactive', animate('100ms ease-in')),
    // ]),
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
export class QueryComponent implements OnInit {
  @Input() chartUtil: ChartUtil;
  @Input() chartType: string;
  @Input() showType: string;
  @Input() iconType: string;
  @Input() cardId: string;
  @Input() dataSetID: string;
  @Input() toRightStateStr: string;
  @Input() toLeftStateStr: string;
  @Input() dataSourceCount: number;
  @Input() dataChange: number;
  @Output() fullScreenEmit = new EventEmitter<any>();
  @Output() changeChartTypeEmit = new EventEmitter<any>();
  @Output() changeQueryTypeEvent = new EventEmitter<any>();
  @Output() changeShowTypeEvent = new EventEmitter<any>();
  @Output() changeRightChartBarEvent = new EventEmitter<any>();
  edit:null;
  queryTemplate: QueryInfo;
  cardResult: QueryResult;
  prettyResult: QueryResultInfo = new QueryResultInfo();
  showPretty: boolean = false;
  dataNotice: string;
  showFlagList = {
    showDownloadFlag: false
  };
  operaterBoxPosition = {top: 0, left: 0};
  fullScreenFlag = false;
  //pagination start
  curPage: number = 0;
  pageSize: number = 100;
  totalPage: number = 1;
  //pagination end
  queryMd5: string;
  editor: any;
  goBackEnable: boolean = true;
  //设置右侧图表是否可用，QUERY默认false
  chartToolBarStatus: boolean = false;
  computeShowDataContanierHeight = new Subject<boolean>();
  screenHeight: number;
  headerHeight: number = 76 + 220;
  footerHeight: number = 45;
  otherHeight = 39 + 90 + 43;
  markHeight: number = 0;
  _showDataContainer: ElementRef;
  @ViewChild('queryEdit') queryEdit: ElementRef;
  // @ViewChild('highchart') highchart: ChartHighChartComponent;
  @ViewChild('confirmBox') confirmBox: ConfirmComponent;
  _queryPretty: QueryPrettyShowComponent;
  @ViewChild('queryPretty')
  set queryPretty(val: QueryPrettyShowComponent) {
    this._queryPretty = val;
  }

  get queryPretty() {
    return this._queryPretty;
  }

  @ViewChild('showDataContainer')
  set showDataContainer(val: ElementRef) {
    this._showDataContainer = val;
    setTimeout(() => {
      this.computeShowDataContanierHeight.next(false);
    }, 0)
  }

  get showDataContainer() {
    return this._showDataContainer;
  }

  @ViewChild('cancelDiv') cancelDiv: ElementRef;
  constructor(private route: ActivatedRoute, public router: Router, private appNotification: AppNotification, private renderer: Renderer, private cardService: CardService, private location: Location,
              private dataHandleSer:DataHandleService) {
    // document.addEventListener('click', () => {
    //   this.hiddenAll();
    // });
    this.computeShowDataContanierHeight.subscribe((isFullScreen: boolean) => {
      let height: number;
      if (isFullScreen) {
        height = this.screenHeight - this.otherHeight;
      } else {
        height = this.screenHeight - this.headerHeight - this.footerHeight - this.otherHeight;
      }
      this.renderer.setElementStyle(this.showDataContainer.nativeElement, 'height', `${height}px`);
      // this.changeSvgView();
    })
  }

  ngOnInit(): void {
    if (history.length <= 0) {
      this.goBackEnable = false;
    } else {
      this.goBackEnable = true;
    }
    this.queryTemplate = new QueryInfo();
    this.queryTemplate.properties = new chartOptions();
    this.screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
    if (this.cardId) {
      this.getCard(this.dataSetID, this.cardId);
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    let dataSetIDChange = changes['dataSetID'];
    if (dataSetIDChange && !dataSetIDChange.isFirstChange()) {
      this.clearResult();
      this.editor.setValue('');
    }
    let cardIdChanges = changes['cardId'];
    if (cardIdChanges && !cardIdChanges.isFirstChange()) {
      if (this.cardId)
        this.getCard(this.dataSetID, this.cardId);
    }
    let dataSourceCountChange = changes['dataSourceCount'];
    if (dataSourceCountChange) {
      this.dataSourceCount = dataSourceCountChange.currentValue;
    }
  }

  ngAfterViewInit() {
    this.editor = ace.edit(this.queryEdit.nativeElement);
    this.editor.setTheme("ace/theme/sqlserver");
    this.editor.getSession().setMode('ace/mode/sql');
    // this.editor.setOptions({
    //   enableBasicAutocompletion: true,
    //   enableSnippets: true,
    //   enableLiveAutocompletion: true
    // });
    console.log('afeter init');
    // this.editor.setValue('');
    this.editor.focus();
    // this.editor.setReadOnly();
    // this.editor.setShowPrintMargin('hidden');
  }

  addTextToEdit(txt: string) {
    console.log('add new');
    this.editor.insert(txt);
    this.editor.focus();
  }

//编辑card时，获取card信息
  getCard(dataSetId: string, cardId: string) {
    this.dataHandleSer.getCard(dataSetId, cardId).subscribe(rep => {
      let card = rep.data as Card;
      if (card) {
        this.title = card.cardName;
        this.desc = card.description;
        let thinQuery = JSON.parse(card.content);
        this.queryTemplate = thinQuery;
        this.queryTemplate.measureIndexs = thinQuery.measureIndexs;
        this.queryTemplate.dimensionIndexs = thinQuery.dimensionIndexs;
        this.editor.setValue(thinQuery.sqlStr);
        this.queryMd5 = Md5.hashStr(JSON.stringify(thinQuery)).toString();
        let mode = card.renderMode;
        if (mode == 'originTable') {
          this.showPretty = false;
        } else {
          this.showPretty = true;
        }
        if (mode != 'table' && mode != 'txt') {
          this.showType = 'chart';
          this.chartType = mode;
          if (mode.toLowerCase().indexOf('bar') >= 0) {
            this.iconType = 'bar';
          } else if (mode.toLocaleLowerCase().indexOf('line') >= 0 || mode.toLocaleLowerCase().indexOf('area') >= 0) {
            this.iconType = 'line';
          } else if (mode.toLocaleLowerCase().indexOf('pie') >= 0) {
            this.iconType = 'pie';
          } else {
            this.iconType = mode;
          }
        } else {
          this.showType = mode;
        }
        // this.prettyResult.properties = this.queryTemplate.properties;
        // this.prettyResult.measureIndexs = this.queryTemplate.measureIndexs;
        // this.prettyResult.dimensionIndexs = this.queryTemplate.dimensionIndexs;

        this.changeChartTypeEmit.emit({
          chartType: mode,
          showType: this.showType,
          toRightStateStr: this.toRightStateStr
        });
        // this.changeSvgView();
        if (this.showPretty && this.showType != 'txt' && this.showType != 'table') {
          setTimeout(() => {
            this.queryPretty.changeSvgView();
          }, 100);
        }
        this.run();
      }
    })
  }

  checkRun() {
    let newSql = this.editor.getValue();
    if (!newSql || newSql.trim() == '') {
      this.appNotification.error('SQL查询语句不能为空！');
      return;
    } else {
      this.queryTemplate.sqlStr = newSql;
      this.run();
    }
  }

  run(fromPagination?: boolean) {
    if (!fromPagination) {
      this.curPage = 0;
    }
    if (!this.queryMd5 && this.queryMd5 != Md5.hashStr(this.queryTemplate.sqlStr).toString()) {
      this.queryTemplate.measureIndexs = [];
      this.queryTemplate.dimensionIndexs = [];
      this.queryTemplate.properties['saiku.ui.render.mode'] = 'originTable';
      this.showPretty = false;
      this.queryMd5 = Md5.hashStr(this.queryTemplate.sqlStr).toString();
      this.chartToolBarStatus = false;
      this.changeRightChartBarEvent.emit(this.chartToolBarStatus);
    } else {
      this.queryTemplate.properties['saiku.ui.render.mode'] = this.chartType;
    }
    Loading.addCircleLoading();
    // this.showCancel();
    let $this = this;
    this.cardService.executeSQLForPage(this.queryTemplate.sqlStr, this.dataSetID, this.curPage, this.pageSize).subscribe(rep => {
      let result = rep.QueryResult as QueryResult;
      if ($this.showPretty) {
        let queryAll = new QueryResultInfo();
        queryAll.queryResult = result;
        queryAll.properties = this.queryTemplate.properties;
        queryAll.measureIndexs = this.queryTemplate.measureIndexs;
        queryAll.dimensionIndexs = this.queryTemplate.dimensionIndexs;
        $this.prettyResult = queryAll;
      }
      $this.cardResult = result;
      $this.loadCardProperties();
      Loading.removeLoading();
      // this.hideCancel();
    }, error => {
      console.log('error');
      Loading.removeLoading();
      // this.hideCancel();
    });
  }

  updateCard(): void {
    let curQueryMd5 = Md5.hashStr(JSON.stringify(this.queryTemplate)).toString();
    if (this.cardId && curQueryMd5 !== this.queryMd5) {
      this.confirmBox.open("查询有改变，是否确定保存？", "save");
    } else {
      this.save();
    }
  }

  /*
   保存card
   */
  save(): void {
    if (this.showType != 'table' && this.showType != 'txt') {
      this.queryTemplate['properties']['saiku.ui.chart.options'] = {
        "showXAxis": this.chartUtil.showXAxis,
        "showYAxis": this.chartUtil.showYAxis,
        "showXAxisLabel": this.chartUtil.showXAxisLabel,
        "xAxisLabel": this.chartUtil.xAxisLabel,
        "showYAxisLabel": this.chartUtil.showYAxisLabel,
        "yAxisLabel": this.chartUtil.yAxisLabel,
        "colorScheme": this.chartUtil.colorScheme,
        "showLegend": this.chartUtil.showLegend
      };
      this.queryTemplate['properties']['saiku.ui.render.mode'] = this.chartType;

    } else {
      this.queryTemplate['properties']['saiku.ui.render.mode'] = this.showType;
    }
    if (!this.showPretty) {
      this.queryTemplate['properties']['saiku.ui.render.mode'] = 'originTable';
    }
    if (!this.title || this.title == '') {
      this.appNotification.error('标题不能为空!');
      return;
    }
    let dataBrief = new Array<object[]>();
    this.queryTemplate.queryMeta = this.cardResult.columnMetaList;
    if (this.cardResult && this.cardResult.results) {
      dataBrief = this.cardResult.results;
    }
    this.queryTemplate.queryType = 'SQL';

    if (!this.cardId || this.cardId == '') {
      this.dataHandleSer.save(this.title, this.desc, this.dataSetID, this.queryTemplate['properties']['saiku.ui.render.mode'], this.queryTemplate, dataBrief, 'SQL').subscribe(rep => {
        this.appNotification.success('保存成功!');
        // let card = rep.data as Card;
        this.router.navigate([`/card/SQL/`, {id: this.dataSetID}]);
      }, (error: Error) => {
        if (error.errMsg == 'card name is exists at current dataSet') {
          this.appNotification.error('已存在同名文件，请修改文件名！');
        }
      })
    } else {

      this.dataHandleSer.update(this.title, this.cardId, this.desc, this.dataSetID, this.queryTemplate['properties']['saiku.ui.render.mode'], this.queryTemplate, dataBrief, 'SQL').subscribe(rep => {
        this.appNotification.success('更新成功!');
      }, (error: Error) => {
        this.appNotification.error(error.errMsg);
      })
    }
  }

  /**
   * 创建新查询
   */
  createNew() {
    this.router.navigate(['/card', 'SQL', {id: this.dataSetID}]);
    this.clearResult();
  }

  clearResult() {
    this.title = '';
    this.desc = '';

    this.chartUtil.options.series = [];
    // this.chartUtil.loadHightChart();
    this.editor.setValue("");
    this.dataNotice = '';
    this.cardResult = new QueryResult;
    this.prettyResult = new QueryResultInfo();
    this.queryTemplate = new QueryInfo();
    this.queryTemplate.properties = new chartOptions();
    this.changeChartTypeEmit.emit({
      chartType: 'table',
      showType: 'table',
      toRightStateStr: this.toRightStateStr
    });
    this.totalPage = 1;
    this.showPretty = false;
  }

  loadCardProperties() {
    if (this.cardResult && this.cardResult.results && this.cardResult.columnMetaList) {
      this.dataNotice = this.cardResult.results.length + '行x' + this.cardResult.columnMetaList.length + '列 ';// /+ (this.queryTemplate.runtime / 1000).toFixed(2) + '秒';
    }
    console.log(this.queryTemplate['properties']['saiku.ui.render.mode'], this.chartType);
    if (this.queryTemplate && this.queryTemplate.properties) {
      // this.totalPage = Math.ceil(this.queryTemplate.height / this.pageSize);
      let renderMode = this.queryTemplate['properties']['saiku.ui.render.mode'];
      this.chartType = renderMode;
      this.changeChartTypeEmit.emit({
        chartType: renderMode,
        showType: this.showType,
        toRightStateStr: this.toRightStateStr
      });
    }
    // this.loadShowMode(renderMode);
  }

  changePrettyMetaFn({dims, measures}) {
    if (dims && measures) {
      this.prettyResult.measureIndexs = measures;
      this.prettyResult.dimensionIndexs = dims;
      this.prettyResult.queryResult = this.cardResult;
      this.queryTemplate.measureIndexs = measures;
      this.queryTemplate.dimensionIndexs = dims;
      this.chartUtil.selectRowCount = dims.length;
      this.chartUtil.measureCount = measures.length;
      this.dataChange = new Date().getTime();
    }
  }

  //#region 分页 start
  prevPage() {
    if (this.curPage > 0) {
      this.curPage--;
      this.run(true);
    }
  }

  nextPage() {
    if (this.curPage >= 0 && this.curPage < this.totalPage - 1) {
      this.curPage++;
      this.run(true);
    }
  }

  changPageFn(isNext: boolean) {
    if (isNext) {
      this.nextPage();
    } else {
      this.prevPage();
    }
  }


  // showCancel() {
  //   let height = document.activeElement.clientHeight;
  //   let width = document.activeElement.clientWidth;
  //   this.renderer.setElementStyle(this.cancelDiv.nativeElement, 'left', (width - 150) / 2 + 'px');
  //   this.renderer.setElementStyle(this.cancelDiv.nativeElement, 'top', (height - 20) / 2 + 'px');
  //   this.renderer.setElementStyle(this.cancelDiv.nativeElement, 'display', 'block');
  // }

  hideCancel() {
    this.renderer.setElementStyle(this.cancelDiv.nativeElement, 'display', 'none');
  }

  cancel() {
    Loading.removeLoading();
    this.hideCancel();
    // this.cardService.cancel(this.helper.model().name).subscribe(rep=> {
    //   this.hideCancel();
    //   Loading.removeLoading();
    // });
  }

  changeQueryType(type: string) {
    this.changeQueryTypeEvent.emit(type);
  }

  // changeSvgView() {
  //   setTimeout(() => {
  //     if (this.svgChartBox) {
  //       let svgBoxInfo = this.svgChartBox.nativeElement.getBoundingClientRect();
  //       this.highchart.changViewFn(svgBoxInfo.width, svgBoxInfo.height);//.changeView(svgBoxInfo.width, svgBoxInfo.height);//
  //     }
  //   }, 120);
  // }

  public title: string;
  // set title(title: string) {
  //   this._title = title;
  // }
  //
  // get title() {
  //   console.log('title');
  //   return this._title || '填写名称'
  // }
  public desc: string;
  // private _desc: string;
  // set desc(desc: string) {
  //   this._desc = desc;
  // }
  //
  // get desc() {
  //   return this._desc;
  // }

  focusFn(e: Event) {
    let target = e.target as any;
    target.select();
  }

  fullScreen() {
    this.fullScreenFlag = !this.fullScreenFlag;
    let height: number;
    if (this.fullScreenFlag) {
      height = this.screenHeight;
      this.changeHeaderAndFooterDisplay(false);
    } else {
      this.changeHeaderAndFooterDisplay(true);
      height = this.screenHeight - this.headerHeight - this.footerHeight;
    }
    this.computeMarkHeight();
    this.fullScreenEmit.emit(height);
    this.computeShowDataContanierHeight.next(this.fullScreenFlag);
  }

  changeHeaderAndFooterDisplay(isShow: boolean) {
    let header = document.getElementsByTagName('header')[0];
    let footer = document.getElementsByTagName('footer')[0];
    if (isShow) {
      this.renderer.setElementStyle(header, 'display', 'block');
      this.renderer.setElementStyle(footer, 'display', 'block');
    } else {
      this.renderer.setElementStyle(header, 'display', 'none');
      this.renderer.setElementStyle(footer, 'display', 'none');
    }


  }

  computeMarkHeight() {
    this.markHeight = Math.round((this.screenHeight - this.headerHeight - this.footerHeight - 39 - 39 - 39 - 27 - 40) / 2);
    console.log('markHeight', this.markHeight)
  }

  showDownloadType(e: any) {
    this.stopBubbleHandle(e);
    this.hiddenOtherLayers('showDownloadFlag');
  }

  stopBubbleHandle(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  hiddenOtherLayers(property: string) {
    for (let p in this.showFlagList) {
      if (p == property) {
        this.showFlagList[p] = true;
      } else {
        this.showFlagList[p] = false;
      }
    }
  }

  hiddenAll() {
    for (let p in this.showFlagList) {
      this.showFlagList[p] = false;
    }
  }

  changePretty(isPrettyShow: boolean) {
    if (isPrettyShow && (!this.prettyResult || !this.queryTemplate.measureIndexs || this.queryTemplate.measureIndexs.length < 1 || this.queryTemplate.dimensionIndexs.length < 1)) {
      this.appNotification.error('请先设置维度和指标');
      return;
    }
    if (isPrettyShow) {
      this.showPretty = true;
      if (this.chartType == 'originTable') {
        this.showType = 'table';

        // this.chartType = 'table';
      }
      if (!this.prettyResult.queryResult || !this.prettyResult.queryResult.hasOwnProperty('results')) {
        let queryAll = new QueryResultInfo();
        queryAll.queryResult = this.cardResult;
        queryAll.properties = this.queryTemplate.properties;
        queryAll.measureIndexs = this.queryTemplate.measureIndexs;
        queryAll.dimensionIndexs = this.queryTemplate.dimensionIndexs;
        this.prettyResult = queryAll;
      }
      this.chartToolBarStatus = true;
      this.changeShowTypeEvent.emit({showType: this.showType, chartType: this.chartType});
    } else {
      this.showPretty = false;
      this.showType == 'originTable';
      this.chartToolBarStatus = false;
      this.changeChartTypeEmit.emit({chartType: this.chartType, showType: this.showType, toRightStateStr: 'inactive'});
    }
    this.changeRightChartBarEvent.emit(this.chartToolBarStatus);

  }

  backPreHistory() {
    if (this.goBackEnable) {
      this.location.back();
      // window.history.go(-1);
    }
  }
}
