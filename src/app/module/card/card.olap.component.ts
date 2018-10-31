/**
 * Created by houxh on 2017-5-17.
 */
import {
  Component, Input, Renderer2, ElementRef, ViewChild, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from '@angular/common';
import {AppNotification} from "../../app.notification";
import * as query from "../../common/model/card/card.query.template";
import {TemplateHelper} from "./templateHelper";
import {Dimension} from "../../common/model/card/schema.dimension";
import {Measure} from "../../common/model/card/schema.measure";
import {CardService} from "../../common/service/card.service";
import {DragulaService} from "ng2-dragula/index";
import {CardResult, Cell} from "../../common/model/card/card.resut";
import {Loading} from "../../common/loading.mask.util";
import {ChartUtil} from "../../chart/chart.util";
import {HashMap} from "../../common/model/card/card.query.template";
import {CardUtils} from "./card.utils";
import {MetaData} from "../../common/model/card/schema.metadata";
import {Intersection} from "./intersection";
import {Card} from "../../common/model/card/card.model";
import {Md5} from "ts-md5/dist/md5";
import {ChartHighChartComponent} from "../../chart/chart.highchart.component";
import {flyIn} from "../../animations";
import {Subject} from "rxjs/Subject";
import {Cube} from "../../common/model/card/schema.cube";
import {ConfirmComponent} from "../common/confirm.component";
import {Error} from "../../common/model/Error"
import {SectionDimensionComponent} from "./section-dimension.component";
import {DrilldownComponent} from "./drilldown.component";
import {ChartMapComponent} from "../../common/maps/chart.map.component";
import {CardLimitComponent} from "./card.limit.component";
import { DataHandleService } from '../../changan/data.handle.service';
@Component({
  selector: 'olap-com',
  templateUrl: './card.olap.component.html',
  styleUrls: ['./card.component.css'],
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
export class OlapComponent implements OnInit, OnChanges {

  @Input() chartUtil: ChartUtil;
  @Input() chartType: string;
  @Input() showType: string;
  @Input() iconType: string;
  @Input() metaDataMap: HashMap<string, MetaData>;
  @Input() validCube: Cube;
  @Input() measures: Measure[];
  @Input() measureGroup: Set<string>;
  @Input() dimensions: Dimension[];
  @Input() cardId: string;
  @Input() dataSetID: string;
  @Input() toRightStateStr: string;
  @Input() toLeftStateStr: string;
  @Input() dataChange: number;
  @Output() changeChartTypeEmit = new EventEmitter<any>();
  @Output() fullScreenEmit = new EventEmitter<any>();
  @Output() changeQueryTypeEvent = new EventEmitter<any>();
  queryTemplate: query.QueryTemplate = new query.QueryTemplate();
  helper = new TemplateHelper();
  selectMeasures: query.Measure[];
  selectRows = [];
  selectColumn = [];
  selectFilter = [];
  cardResult: CardResult;
  selectCubeName = new HashMap<string, string>();
  cardUtils = new CardUtils();
  toolBarObj: any = {autoExecute: true, formatter: false, noEmpty: true, drillDown: false, section: false};
  filterCondition: query.FilterCondition[];
  showFlagList = {
    editFilterFlag: false,
    showDownloadFlag: false,
    showOperaterBoxFlag: false
  }
  operaterBoxPosition = {top: 0, left: 0};
  dimType: string;
  fullScreenFlag = false;
  //pagination start
  curPage: number = 0;
  pageSize: number = 100;
  totalPage: number = 1;
  //pagination end
  dimensionContainers = ['ROWS', 'COLUMNS', 'FILTER'];
  dataNotice: string;
  queryMd5: string;
  goBackEnable: boolean = true;
  changeShow: boolean = true;
  @ViewChild('sectionDimension') sectionDimension: SectionDimensionComponent;
  @ViewChild('drilldown') drilldownCom: DrilldownComponent;
  @ViewChild('highchart') highchart: ChartHighChartComponent;
  @ViewChild('chartmap') chartmap: ChartMapComponent;
  @ViewChild('confirmBox') confirmBox: ConfirmComponent;
  @ViewChild('cancelDiv') cancelDiv: ElementRef;
  @ViewChild('filterBox') filterBox: ElementRef;
  @ViewChild('keyBox') keyBox: ElementRef;
  @ViewChild('indicatorBox') indicatorBox: ElementRef;
  @ViewChild('svgChartBox') svgChartBox: ElementRef;
  @ViewChild('cardLimit') cardLimit:CardLimitComponent;
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

  private computeShowDataContanierHeight = new Subject<boolean>();
  private screenHeight: number;
  private headerHeight: number = 76;
  private footerHeight: number = 45;
  private otherHeight = 39 + 90 + 43;
  private _showDataContainer: ElementRef;
  private isFold = true;
  private markHeight: number = 0;

  constructor(private route: ActivatedRoute, public router: Router, private appNotification: AppNotification, private renderer: Renderer2, private cardService: CardService, private dragulaService: DragulaService, private location: Location
  ,private dataHandleSer: DataHandleService) {
    document.addEventListener('click', (e) => {
      this.hiddenAll()
    });
    this.computeShowDataContanierHeight.subscribe((isFullScreen: boolean) => {
      let height: number;
      let filterBoxHeight: number;
      if (this.isFold) {
        filterBoxHeight = 0;
      } else {
        filterBoxHeight = this.filterBox.nativeElement.getBoundingClientRect().height;
      }
      if (isFullScreen) {
        height = this.screenHeight - this.otherHeight - filterBoxHeight;
      } else {
        height = this.screenHeight - this.headerHeight - this.footerHeight - this.otherHeight - filterBoxHeight;
      }
      this.renderer.setStyle(this.showDataContainer.nativeElement, 'height', `${height}px`);
      // this.changeSvgView();
    })
    this.initDrag();
  }

  ngOnInit(): void {
    console.log('init ...', this.cardId);

    if (history.length <= 0) {
      this.goBackEnable = false;
    } else {
      this.goBackEnable = true;
    }
    this.screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
    this.queryTemplate = this.helper.model();
    this.initQueryTemplate();
    this.clearResult();

    if (this.cardId) {
      this.getCard(this.dataSetID, this.cardId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let cubeChange = changes['validCube'];
    let chartTypeChange = changes['chartType'];
    let showTypeChange = changes['showType'];
    if (cubeChange && !cubeChange.isFirstChange()) {
      this.validCube = cubeChange.currentValue;
      this.helper.queryTemplate.cube = this.validCube;
    }
    let toRightStateStrChange = changes['toRightStateStr'];
    let toLeftStateStrChange = changes['toLeftStateStr'];
    if (chartTypeChange || showTypeChange || toRightStateStrChange || toLeftStateStrChange) {
      this.changeSvgView();
    }
    let cardIdChanges = changes['cardId'];
    if (cardIdChanges && !cardIdChanges.isFirstChange()) {
      if (this.cardId)
        this.getCard(this.dataSetID, this.cardId);
    }
    let dataChangeChanges = changes['dataChange'];
    if (dataChangeChanges && !dataChangeChanges.isFirstChange()) {
      this.helper = new TemplateHelper();
      this.queryTemplate = this.helper.model();
      this.selectColumn = [];
      this.selectRows = [];
      this.selectFilter = [];
      this.selectMeasures = [];
      this.totalPage = 1;
      this.initQueryTemplate();
      this.clearResult();
    }

  }

  private hiddenAll() {
    for (let p in this.showFlagList) {

      this.showFlagList[p] = false;
    }
  }

  checkRun() {
    let validated = false;
    let errorMessage = '';
    let exModel = this.helper.model();
    let auto = exModel.properties ? exModel.properties['saiku.olap.query.automatic_execution'] : this.toolBarObj.autoExecute;
    this.filterCondition = this.helper.getAllParameter();
    this.reload();
    if (!auto) {
      if (this.selectRows.length == 0 || this.selectColumn.length == 0 || this.selectMeasures.length == 0) {
        this.clearResult();
      }
      return;
    } else {
      this.run();
    }
  }

  run(fromPagination?: boolean) {
    if (!fromPagination) {
      this.curPage = 0;
    }
    this.chartUtil.selectColumnCount = this.helper.getAxis("COLUMNS").hierarchies.length;
    this.chartUtil.selectRowCount = this.helper.getAxis("ROWS").hierarchies.length;
    this.chartUtil.measureCount = this.helper.getMeasures().length;

    let validated = false;
    let errorMessage = '';
    this.queryTemplate = this.helper.model();
    if (this.queryTemplate.queryType == "OLAP") {
      if (this.queryTemplate.type == "QUERYMODEL") {
        let columnsOk = this.queryTemplate.queryModel.axes.COLUMNS.hierarchies.length > 0;
        let rowsOk = this.queryTemplate.queryModel.axes.ROWS.hierarchies.length > 0;
        let detailsOk = this.queryTemplate.queryModel.details.axis == 'COLUMNS' && this.queryTemplate.queryModel.details.measures.length > 0;
        if (!rowsOk || !columnsOk || !detailsOk) {
          errorMessage = "";
        }
        if (!columnsOk && !detailsOk) {
          errorMessage += '需要至少一个指标或者在列中包含至少一个维度的Level。';
        }
        if (!rowsOk) {
          errorMessage += '需要在行中包含至少一个维度的Level。';

        }
        if ((columnsOk || detailsOk) && rowsOk) {
          validated = true;
        }

      } else if (this.queryTemplate.type == "MDX") {
        validated = (this.queryTemplate.mdx && this.queryTemplate.mdx.length > 0);
        if (!validated) {
          errorMessage = '需要输入MDX表达式。';
        }
      }
      if (!validated) {
        this.clearResult();
        this.reload();
        this.appNotification.error(errorMessage);
        return;
      }
    }
    if (this.showType != 'chart') {
      this.queryTemplate.properties['saiku.ui.render.mode'] = this.showType;
    } else {
      this.queryTemplate.properties['saiku.ui.render.mode'] = this.chartType;
    }

    Loading.addCircleLoading();
    this.showCancel();
    this.dataHandleSer.executeForPage(this.queryTemplate, this.curPage, this.pageSize).subscribe(rep => {
      this.cardResult = rep.data as CardResult;
      this.helper.queryTemplate = this.cardResult.query;
      this.reload();
      this.loadCardProperties();
      this.filterCondition = this.helper.getAllParameter();
      this.changeSvgView();
      Loading.removeLoading();
      this.hideCancel();
    }, error => {
      this.appNotification.error('查询出错');
      Loading.removeLoading();
      this.hideCancel();
    });
  }

  updateCard(): void {
    this.queryTemplate.mdx = '';
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
      this.queryTemplate.properties['saiku.ui.chart.options'] = {
        "showXAxis": this.chartUtil.showXAxis,
        "showYAxis": this.chartUtil.showYAxis,
        "showXAxisLabel": this.chartUtil.showXAxisLabel,
        "xAxisLabel": this.chartUtil.xAxisLabel,
        "showYAxisLabel": this.chartUtil.showYAxisLabel,
        "yAxisLabel": this.chartUtil.yAxisLabel,
        "colorScheme": this.chartUtil.colorScheme,
        "showLegend": this.chartUtil.showLegend
      };
      this.queryTemplate.properties['saiku.ui.render.mode'] = this.chartType;
    } else {
      this.queryTemplate.properties['saiku.ui.render.mode'] = this.showType;
    }
    if (!this.title || this.title == '') {
      this.appNotification.error('标题不能为空!');
      return;
    }
    let dataBrief = new Array<Cell[]>();
    if (this.cardResult && this.cardResult.cellset) {
      dataBrief = this.cardResult.cellset;
    }
    if (!this.cardId || this.cardId == '') {
      this.dataHandleSer.save(this.title, this.desc, this.dataSetID, this.queryTemplate.properties['saiku.ui.render.mode'], this.queryTemplate, dataBrief, 'OLAP').subscribe(rep => {
        this.appNotification.success('保存成功!');
        let card = rep.data as Card;
        this.router.navigate([`/card/OLAP/`, {id: this.dataSetID, cardId: card.cardId}]);
      }, (error: Error) => {
        console.log(error);
        console.log(error.errorMsg);
        if (error.errorMsg == 'card name is exists at current dataSet') {
          this.appNotification.error('已存在同名文件，请修改文件名！');
        } else {
          this.appNotification.error(error.errorMsg);
        }
      })
    } else {

      this.dataHandleSer.update(this.title, this.cardId, this.desc, this.dataSetID, this.queryTemplate.properties['saiku.ui.render.mode'], this.queryTemplate, dataBrief, 'OLAP').subscribe(rep => {
        this.appNotification.success('更新成功!');
      }, (error: Error) => {
        this.appNotification.error(error.errMsg);
      })
    }
  }

  clearResult() {
    this.cardResult = new CardResult();
    // this.chartUtil = new ChartUtil();
    // this.chartUtil.multi = [];
    // this.chartUtil.single = [];
    // this.chartUtil.options.series = [];
    this.chartUtil.loadHightChart();
    this.dataNotice = '';
  }

  /*
   重新加载选中的行、列、过滤
   */
  reload() {
    this.dataNotice = '';
    console.log('reload...');
    this.selectRows = this.cardUtils.deepCloneHierarchies(this.helper.getAxis('ROWS').hierarchies);
    this.selectColumn = this.cardUtils.deepCloneHierarchies(this.helper.getAxis('COLUMNS').hierarchies);
    this.selectFilter = this.cardUtils.deepCloneHierarchies(this.helper.getAxis('FILTER').hierarchies);
    this.selectMeasures = this.helper.getMeasures();
    let dims = [];
    if (this.selectRows) {
      this.selectRows.forEach(h => {
        dims.push(h.dimension);
      });
    }
    if (this.selectColumn) {
      this.selectColumn.forEach(h => {
        dims.push(h.dimension);
      });
    }
    if (this.selectFilter) {
      this.selectFilter.forEach(h => {
        dims.push(h.dimension);
      });
    }
    this.intersect(dims, 'dimension', 'add');
    let ms = [];
    if (this.selectMeasures) {
      this.selectMeasures.forEach(m => {
        ms.push(m.name);
      });
    }
    this.intersect(ms, 'measure', 'add');

  }

  //获取多个 metadata的交集
  intersect(selectMembers: string[], memberType: string, opType: string) {
    let inter = new Intersection(this.metaDataMap);
    this.selectCubeName.clear();
    if (opType == 'add') {
      if (memberType == 'measure') {
        for (let member of selectMembers) {
          let mCubeName = inter.findCubeName(member, 'measure');
          mCubeName.forEach(cubeName => {
            this.selectCubeName.add(member, cubeName);
          })

        }
      } else {
        for (let member of selectMembers) {
          let dimCubeName = inter.findCubeName(member, 'dimension');
          dimCubeName.forEach(cubeName => {
            this.selectCubeName.add(member, cubeName);
          })
        }
      }
    } else if (opType == 'del') {
      for (let member of selectMembers) {
        this.selectCubeName.del(member);
      }
    }
    let meta = inter.intersect(this.selectCubeName);
    this.measures = meta.measures;
    this.dimensions = meta.dimensions;
  }


  initDrag() {
    let oldDim = this.dragulaService.find("dimBag");
    if (oldDim) {
      this.dragulaService.destroy("dimBag");
    }
    let oldMeasure = this.dragulaService.find("measureBag");
    if (oldMeasure) {
      this.dragulaService.destroy("measureBag");
    }
    this.dragulaService.setOptions('dimBag', {
      copy: (e, fromContainer) => {
        if (this.hasClass(fromContainer, 'third_box')) {
          return true;
        }
        return false;
      },
      removeOnSpill: false

    });
    this.dragulaService.setOptions('measureBag', {
      copy: (e, fromContainer) => {
        if (this.hasClass(fromContainer, 'drag_fromMeasure')) {
          return true;
        }
        return false;
      },
      removeOnSpill: false
    });
    this.dragulaService.drop.subscribe((value) => {
      this.onDrop(value.slice(1));
    });
  }

  onDrop(args) {
    let [e, toContainer, fromContainer, insert] = args;
    if (toContainer == null || fromContainer == null)
      return;
    if (toContainer === fromContainer) {//排序
      let oldIndex = e.dataset.index;
      if (fromContainer.dataset.container != 'toMeasure' && toContainer.dataset.container == fromContainer.dataset.container) {
        let dimType = toContainer.dataset.container;
        if (insert != null)
          this.sortDimension(dimType, oldIndex, insert.dataset.name);
        else
          this.sortDimension(dimType, oldIndex, null);
      } else {
        let sortMesures = this.helper.getMeasures();
        if (insert != null)
          this.sortMeasures(sortMesures, oldIndex, insert.dataset.name);
        else
          this.sortMeasures(sortMesures, oldIndex, null);
      }
      // this.reload();
      this.checkRun();
    }
    else if (this.dimensionContainers.indexOf(fromContainer.dataset.container) >= 0 && this.dimensionContainers.indexOf(toContainer.dataset.container) >= 0) {
      //如果行、列、过滤之间进行拖拽，那么调用
      let fromAxis = fromContainer.dataset.container;
      let toAxis = toContainer.dataset.container;
      let hierarchyName = e.dataset.name;
      this.helper.moveHierarchy(fromAxis, toAxis, hierarchyName);
      this.checkRun();
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
    } else if (toContainer.dataset && (toContainer.dataset.container == 'ROWS' || toContainer.dataset.container == 'COLUMNS' || toContainer.dataset.container == 'FILTER')) {
      let hierarchyName = e.dataset.hierarchyName;
      let hierarchyCaption = e.dataset.hierarchyCaption;
      let levelName = e.dataset.levelName;
      let levelCaption = e.dataset.levelCaption;
      let dimension = e.dataset.dimension;
      let levelIndex = e.dataset.levelIndex;
      let axisName = toContainer.dataset.container;
      this.addDimension(axisName, hierarchyName, hierarchyCaption, levelName, levelCaption, dimension, levelIndex);
      // toContainer.innerHtml = '';
      if (insert != null)
        this.sortDimension(axisName, -1, insert.dataset.name);
      else
        this.sortDimension(axisName, -1, null);
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
    } else if (toContainer.dataset && toContainer.dataset.container == 'toMeasure') {
      let m = new Measure();
      m.name = e.dataset.name;
      m.caption = e.dataset.caption;
      m.uniqueName = e.dataset.uniqueName;
      this.addMeasure(m);
      let sortMesures = this.helper.getMeasures();
      if (insert != null)
        this.sortMeasures(sortMesures, -1, insert.dataset.name);
      else
        this.sortMeasures(sortMesures, -1, null);
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
    }

  }

  sortDimension(dimType: string, oldIndex: number, insertName: string) {
    let axis = this.helper.getAxis(dimType);
    let newArr = this.cardUtils.simpleCloneQueryHierarchy(axis.hierarchies);
    if (oldIndex == -1) {
      //新增维度时
      oldIndex = axis.hierarchies.length - 1;
    }
    newArr.splice(oldIndex, 1);
    if (insertName != null) {
      let newIndex = newArr.findIndex(h => {
        if (h.name == insertName) return true;
      })
      newArr.splice(newIndex, 0, axis.hierarchies[oldIndex]);
    } else {
      newArr.splice(newArr.length, 0, axis.hierarchies[oldIndex]);
    }
    axis.hierarchies = newArr;
    // this.reload();
  }

  sortMeasures(sortMesures: query.Measure[], oldIndex: number, insertName: string) {
    let newSortMeasures = this.cardUtils.simpleCloneQueryMeasure(sortMesures);
    if (oldIndex == -1) {
      oldIndex = sortMesures.length - 1;
    }
    newSortMeasures.splice(oldIndex, 1);
    if (insertName != null) {
      let newIndex = newSortMeasures.findIndex(h => {
        return h.name == insertName;
      })
      newSortMeasures.splice(newIndex, 0, sortMesures[oldIndex]);
    } else {
      newSortMeasures.splice(newSortMeasures.length, 0, sortMesures[oldIndex]);
    }
    this.helper.model().queryModel.details.measures = newSortMeasures;
    // this.reload();
  }

  addMeasure(item: Measure) {
    let qMeasure = new query.Measure();
    qMeasure.name = item.name;
    qMeasure.type = "EXACT";
    qMeasure.uniqueName = item.uniqueName;
    qMeasure.caption = item.caption;
    this.helper.includeMeasure(qMeasure);
    this.selectMeasures = this.helper.getMeasures();
    this.checkRun();
  }

  addDimension(axisName: string, hierarchy: string, hierarchyCaption: string, levelName: string, levelCaption: string, dimensionName: string, levelIndex: number) {
    this.helper.includeLevel(axisName, hierarchy, hierarchyCaption, levelName, levelCaption, dimensionName, levelIndex);
    this.checkRun();
  }

  delLv(e: any, axisName: string, hierarchyName: string, lvName: string) {
    e.stopPropagation();
    this.helper.removeLevel(hierarchyName, lvName);
    this.checkRun();
  }

  delHierarchy(hierarchyName: string) {
    this.helper.removeHierarchy(hierarchyName);
    this.checkRun();
  }

  clearAxis(axisName: string) {
    let hierarchies = this.helper.model().queryModel.axes[axisName].hierarchies;
    let hierarchyNames = [];
    if (hierarchies) {
      for (let i = 0; i < hierarchies.length; i++) {
        hierarchyNames.push(hierarchies[i].name);
      }
    }
    if (this.helper.getAxis(axisName).hierarchies.length == 0)
      return;
    this.helper.clearAxis(axisName);
    this.checkRun();
  }

  delMeasure(measureName: string) {
    this.helper.removeMeasure(measureName);
    let allMeasure = this.helper.getMeasures();
    let measureNames = [];
    for (let i = 0; i < allMeasure.length; i++) {
      measureNames.push(allMeasure[i].name);
    }
    this.selectMeasures = this.helper.getMeasures();
    this.checkRun();
  }

  clearMeasure() {
    let allMeasure = this.helper.getMeasures();
    let measureNames = [];
    for (let i = 0; i < allMeasure.length; i++) {
      measureNames.push(allMeasure[i].name);
    }
    this.helper.clearMeasures();
    this.selectMeasures = this.helper.getMeasures();
    this.checkRun();
  }

  swapAxes() {
    this.helper.swapAxes();
    this.reload();
    this.checkRun();
  }

  //设置toolbar中的状态
  setMode(e: any, mode: string) {
    let spanNode = e.target['parentNode'];// Array.prototype.slice.call(e.target['parentNode'], 0);
    if (mode == 'run') {
      let auto = this.helper.model().properties ? this.helper.model().properties['saiku.olap.query.automatic_execution'] : this.toolBarObj.autoExecute;
      if (auto) {
        this.toolBarObj.autoExecute = false;
        this.helper.model().properties['saiku.olap.query.automatic_execution'] = false;
      } else {
        this.toolBarObj.autoExecute = true;
        this.helper.model().properties['saiku.olap.query.automatic_execution'] = true;
      }
    } else if (mode == 'formatter') {
      let format = this.helper.model().properties['saiku.olap.result.formatter'];
      if (format == 'flattened') {
        this.toolBarObj.formatter = true;
        this.helper.model().properties['saiku.olap.result.formatter'] = 'flat';
      } else if (format == 'flat') {
        this.toolBarObj.formatter = false;
        this.helper.model().properties['saiku.olap.result.formatter'] = 'flattened';
      }
      this.checkRun();
    } else if (mode == 'noEmpty') {
      let status = this.helper.model().properties['saiku.olap.query.nonempty'];
      if (status) {
        this.toolBarObj.noEmpty = false;
        this.helper.model().properties['saiku.olap.query.nonempty'] = false;
        this.helper.getAxis('ROWS').nonEmpty = false;
        this.helper.getAxis('COLUMNS').nonEmpty = false;
      } else {
        this.toolBarObj.noEmpty = true;
        this.helper.model().properties['saiku.olap.query.nonempty'] = true;
        this.helper.getAxis('ROWS').nonEmpty = true;
        this.helper.getAxis('COLUMNS').nonEmpty = false;
      }
      this.checkRun();
    } else if (mode == 'drillDown') {
      this.toolBarObj.drillDown = this.toolBarObj.drillDown ? false : true;
      if (this.toolBarObj.drillDown) {
        this.toolBarObj.section = false;
      }
    } else if (mode == 'section') {
      this.toolBarObj.section = this.toolBarObj.section ? false : true;
      if (this.toolBarObj.section) {
        this.toolBarObj.drillDown = false;
      }
    }
  }

  loadCardProperties() {
    if (this.cardResult && this.cardResult.query) {
      this.toolBarObj.autoExecute = this.cardResult.query.properties['saiku.olap.query.automatic_execution'];
      this.toolBarObj.formatter = this.cardResult.query.properties['saiku.olap.result.formatter'] == 'flat' ? true : false;
      this.toolBarObj.noEmpty = this.cardResult.query.properties['saiku.olap.query.nonempty'];
      this.dataNotice = this.cardResult.height + '行x' + this.cardResult.width + '列 / ' + (this.cardResult.runtime / 1000).toFixed(2) + '秒';
      this.totalPage = Math.ceil((this.cardResult.height - this.cardResult.topOffset) / this.pageSize);
      let renderMode = this.cardResult.query.properties['saiku.ui.render.mode'];
      this.chartType = renderMode;
    }
    // this.loadShowMode(renderMode);
  }

  //导出操作 start
  exportExcel() {
    this.dataHandleSer.exportExcel(this.queryTemplate.name, this.title);
  }

  exportPDF() {
    this.dataHandleSer.exportPDF(this.queryTemplate.name);
  }

  exportImage() {

    if (this.showType == 'table' || this.showType == 'txt') {
      alert('图片只可以导出图表，不可以导出表格和文本');
      return;
    }
    if (this.chartType == 'china-map') {
      this.chartmap.exportImgFn();
    } else {
      this.highchart.exportImgFn();
    }
    return false;
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

  private changeHeaderAndFooterDisplay(isShow: boolean) {
    let header = document.getElementsByTagName('header')[0];
    let footer = document.getElementsByTagName('footer')[0];
    if (isShow) {
      this.renderer.setStyle(header, 'display', 'block');
      this.renderer.setStyle(footer, 'display', 'block');
    } else {
      this.renderer.setStyle(header, 'display', 'none');
      this.renderer.setStyle(footer, 'display', 'none');
    }


  }

  //导出操作 end

  //初始化查询model
  initQueryTemplate() {
    if (!this.queryTemplate.name) {
      this.helper.queryTemplate.cube = this.validCube;
      this.helper.queryTemplate.name = this.cardUtils.createUUID();
    }
  }

//编辑card时，获取card信息
  getCard(dataSetId: string, cardId: string) {
    this.dataHandleSer.getCard(dataSetId, cardId).subscribe(rep => {
      let card = rep.data as Card;
      if (card) {
        this.title = card.cardName;
        this.desc = card.description;
        let thinQuery = JSON.parse(card.content.replace(/\n/g, ' ')) as query.QueryTemplate;
        this.queryTemplate = thinQuery;
        this.queryTemplate.mdx = '';
        this.queryMd5 = Md5.hashStr(JSON.stringify(this.queryTemplate)).toString();
        let mode = thinQuery.properties['saiku.ui.render.mode'];
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
        this.changeChartTypeEmit.emit({
          chartType: mode,
          showType: this.showType,
          toRightStateStr: this.toRightStateStr
        });
        this.changeSvgView();
        this.helper.queryTemplate = thinQuery;
        this.helper.getHierarchyLevels();
        this.run();
      }
    },(err) => {
      let errMsg = '数据查询出错！';
      if(err && err.error && err.error.errorMsg) {
        errMsg = err.error.errorMsg;
        if(errMsg.indexOf('报表不存在')>=0) {
          this.cardId = '';
        }
      }
      this.appNotification.error(errMsg);
    });
  }

  showSectionDimension(e: MouseEvent) {
    if (this.toolBarObj.drillDown) {
      this.drilldownCom.showModal(e);
    } else if (this.toolBarObj.section) {
      this.sectionDimension.show(e);
    }
  }

  /**
   * 创建新查询
   */
  createNew() {
    this.router.navigate(['/card', 'OLAP', {id: this.dataSetID}]);
    this.toolBarObj.drillDown = false;
    this.toolBarObj.section = false;
    this.helper.clearMeasures();
    this.helper.clearAxis('ROWS');
    this.helper.clearAxis('COLUMNS');
    this.helper.clearAxis('FILTER');
    this.helper.clearAggs();
    this.selectRows = [];
    this.selectColumn = [];
    this.selectFilter = [];
    this.selectMeasures = [];
    this.title = '';
    this.desc = '';
    this.clearResult();
    this.queryTemplate = this.helper.model();
    this.queryTemplate.mdx = '';
    this.queryTemplate.name = this.cardUtils.createUUID();
    this.totalPage = 1;
    this.changeChartTypeEmit.emit({chartType: 'table', showType: 'table', toRightStateStr: this.toRightStateStr});
  }

  private hasClass(el: any, name: string) {
    if (!el || !el.className) {
      return false;
    }
    if (el.className) {
      return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
    }
    return false;
  }

  private _title: string;
  set title(title: string) {
    this._title = title;
  }

  get title() {
    return this._title || ''
  }

  private _desc: string;
  set desc(desc: string) {
    this._desc = desc;
  }

  get desc() {
    return this._desc;
  }

  focusFn(e: Event) {
    let target = e.target as any;
    target.select();
  }

  showCancel() {
    let height = document.body.clientHeight;
    let width = document.body.clientWidth;//.getElementsByTagName('body')[0].clientWidth;
    console.log('width:', width);
    this.renderer.setStyle(this.cancelDiv.nativeElement, 'left', width / 2 - 75 + 'px');
    this.renderer.setStyle(this.cancelDiv.nativeElement, 'top', height / 2 - 20 + 'px');
    this.renderer.setStyle(this.cancelDiv.nativeElement, 'display', 'block');
  }

  hideCancel() {
    this.renderer.setStyle(this.cancelDiv.nativeElement, 'display', 'none');
  }

  cancel() {
    this.dataHandleSer.cancel(this.helper.model().name).subscribe(rep => {
      this.hideCancel();
      Loading.removeLoading();
    }, error => {
      this.hideCancel();
      Loading.removeLoading();
    });
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

  //#region 分页 end
  private backPreHistory() {
    if (this.goBackEnable) {
      this.location.back();
      // window.history.go(-1);
    }
  }

  changeSvgView() {
    console.log('changeSvgView');
    setTimeout(() => {
      if (this.svgChartBox) {
        let svgBoxInfo = this.svgChartBox.nativeElement.getBoundingClientRect();
        if (this.chartType == 'china-map') {
          this.chartmap.changViewFn(svgBoxInfo.width, svgBoxInfo.height);
        } else {
          this.highchart.changViewFn(svgBoxInfo.width, svgBoxInfo.height);//.changeView(svgBoxInfo.width, svgBoxInfo.height);//
        }
      }
    }, 120);
  }

  private computeMarkHeight() {
    this.markHeight = Math.round((this.screenHeight - this.headerHeight - this.footerHeight - 39 - 39 - 39 - 27 - 40) / 2);
    console.log('markHeight', this.markHeight)
  }

  private onFoldFilterBox(e: any) {
    this.isFold = !this.isFold;
    setTimeout(() => {
      this.computeShowDataContanierHeight.next(this.fullScreenFlag);
    }, 0)
  }

  showOperaterBox(e: any, type: string) {
    e.preventDefault();
    e.stopPropagation();
    this.dimType = type;
    this.hiddenOtherLayers('showOperaterBoxFlag');
    this.operaterBoxPosition.top = e.target.parentNode.getBoundingClientRect().top - this.keyBox.nativeElement.getBoundingClientRect().top;
    this.operaterBoxPosition.left = (e.target.parentNode.getBoundingClientRect().left - this.keyBox.nativeElement.getBoundingClientRect().left) + this.indicatorBox.nativeElement.getBoundingClientRect().width;
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

  changeQueryType(type: string) {
    this.changeQueryTypeEvent.emit(type);
    // if(!this.cardId){
    //   //创建
    //   if(type=='SQL'){
    //     this.router.navigate(['/card','SQL', this.dataSetID]);
    //   }else {
    //     this.router.navigate(['/card', 'OLAP',this.dataSetID]);
    //   }
    // }else{
    //   //编辑
    //   if(type=='SQL'){
    //     this.router.navigate(['/card','SQL', this.dataSetID], {queryParams: {cardId: this.cardId}});
    //   }else {
    //     this.router.navigate(['/card','OLAP', this.dataSetID], {queryParams: {cardId: this.cardId}});
    //   }
    // }
  }
  limitFn(){
    this.cardLimit.show();
  }
  showDownloadType(e: any) {
    this.stopBubbleHandle(e);
    this.hiddenOtherLayers('showDownloadFlag');
  }

  stopBubbleHandle(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }
  // 编辑数据模型
  editDataSet() {

  }
}
