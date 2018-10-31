/**
 * Created by fengjj on 2017/4/11.
 */
import {
  Component,
  ElementRef,
  Input,
  QueryList,
  Renderer,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
// import { DashboardService } from "../../common/service/dashboard.service";
import {
  ChartInfo,
  Dashboard,
  Page,
  Panel,
  PanelType,
  SinglePanelFilter
} from "../../common/model/dashboard.model";
import { LayoutUtil } from "./layout-util";
import { NgGridItemEvent } from "angular2-grid/dist/main";
import { ResourcePermission } from "../../common/model/resource-permission.model";
import { Card } from "../../common/model/card/card.model";
import { CardService } from "../../common/service/card.service";
import { Loading } from "../../common/loading.mask.util";
import { Dimension } from "../../common/model/card/schema.dimension";
import { TemplateHelper } from "../card/templateHelper";
import { PanelInitComponent } from "./panel-init.component";
import { DrilldownComponent } from "../card/drilldown.component";
import { SectionDimensionComponent } from "../card/section-dimension.component";
import { DashboardTemplateService } from "../../common/service/dashboard-template.service";
import { DashboardTemplate } from "../../common/model/dashboard-template.model";
import { DomSanitizer } from "@angular/platform-browser";
import { DataHandleService } from '../../changan/data.handle.service';

declare var html2canvas: any;
declare var pdfMake: any;
declare var canvg: any;
@Component({
  selector: 'common-preview',
  templateUrl: './common-preview.component.html',
  styleUrls: ['./common-preview.component.css']
})
export class CommonPreviewComponent {
  dashboardTemplate: DashboardTemplate;
  @Input() fromTemplateList: boolean = false;
  @Input() dashboard: Dashboard;
  isTemplate: boolean;
  @Input() isPreview: boolean;
  //@ViewChild('curBorderBottom') curBorderBottom:ElementRef;
  curBorderBottomPosition = {
    width: 0,
    left: -500
  }
  @ViewChild('pageList') pageList: ElementRef;
  //dashboard:Dashboard = new Dashboard();
  id: string;
  pageArr: Page[] = [];
  safeUrlMap: any = {};
  curPage: Page = new Page();
  curPanel: Panel = new Panel();
  panelCharts: { [key: string]: ChartInfo } = {};
  showFilterIndex: number = -1;
  selectPanelFilters = new Array<SinglePanelFilter>();
  previewFilterPos = {
    top: 0,
    left: 0
  }
  gridsterOptions: any = {
    lanes: 12,
    direction: 'vertical',
    dragAndDrop: false,
    sizeScale: true
  }
  layerFlags = {
    panelFilterFlag: false,
    setOperateFlag: false
  }
  PERMISSION_TYPE: any = ResourcePermission.PERMISSION_TYPE;
  RESOURCE_TYPE_DASHBOARD: string = ResourcePermission.RESOURCE_TYPE.DASHBOARD;
  CONTAINER_CONFIG: any = Object.assign({}, LayoutUtil.CONTAINER_VIEW_CONFIG);
  @Input() dimensions: Dimension[];
  @Input() helper: TemplateHelper;
  @Input() drill: boolean;
  @Input() section: boolean;
  drillPanelID: string;
  curPanelQueryType: string;
  // @ViewChild('panelContent') panelContent:PanelInitComponent;
  @ViewChildren(PanelInitComponent) panelContentList: QueryList<PanelInitComponent>;
  @ViewChild('drilldown') drilldownCom: DrilldownComponent;
  @ViewChild('sectionDimension') sectionDimension: SectionDimensionComponent;
  constructor(private router: Router, private route: ActivatedRoute, private cardService: CardService, private renderer: Renderer, private dashboardTemplateService: DashboardTemplateService, private sanitizer: DomSanitizer,
              private dataHandleSer: DataHandleService) {
    document.body.addEventListener('click', (e) => {
      if (this.hasClass(e.target, 'preview_filter') || this.hasClass(e.target, 'input_filter'))
        return false;
      this.closeOtherLayer();
    })
  }
  // private safeUrl : any;

  private hasClass(el: any, name: string) {
    if (!el || !el.className) {
      return false;
    }
    if (el.className) {
      return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
    }
    return false;
  }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['dashboard'] && changes['dashboard'].currentValue) {
      this.dashboard = changes['dashboard'].currentValue;
      this.dashboard.createUserAvatarUrl = this.dashboard.createUserAvatarUrl?this.dashboard.createUserAvatarUrl:'assets/img/head.png';
      let templateID = this.dashboard.templateID;
      if (templateID) {
        this.isTemplate = true;
        //根据templateID 获取 dashboardTemplate对象 继而获取dataSourceType
        this.dashboardTemplateService.getById(templateID).subscribe((data: any) => {
          this.dashboardTemplate = DashboardTemplate.build(data);
        })
      } else {
        this.isTemplate = false;
      }
      if (this.dashboard.content.length == 0) {
        return;
      }
      this.pageArr = this.dashboard.content.map((page: Page) => {
        let tmpPage = Page.build(page);
        if (tmpPage.href) {
          this.safeUrlMap[page.pageID] = this.sanitizer.bypassSecurityTrustResourceUrl(tmpPage.href);
        }
        return tmpPage;
      });
      this.initPage(this.pageArr[0].pageID);
    }
  }

  initPage(pageID: string) {
    this.curPage = this.pageArr.find((page: Page) => {
      return page.pageID == pageID;
    })

    if (!this.curPage.href) {
      this.showTableFilter();
    }

  }


  showTableFilter() {
    this.curPage.panels.forEach(panel => {
      if (panel.dataShowType != undefined && panel.panelType == PanelType.table) {
        // console.log('content:',panel.data);
        let card = panel.data as Card;
        if (!card.queryType) {
          card.queryType = 'OLAP';
        }
        // panel.panelName=card.cardName;
        // this.cardService.getCardSimple(card.dataSetId, card.cardId).subscribe((data:any)=> {
        //   let cardInfo = data.Card as Card;
        //   panel.panelName = cardInfo.cardName;
        // })
      }
      //是否有需要显示的筛选条件
      let showFilterOpt = false;
      if (panel.singlePanelFilters && panel.singlePanelFilters.length > 0) {
        panel.singlePanelFilters.forEach(filter => {
          if (filter.show) {
            showFilterOpt = true;
          }
          if (!showFilterOpt)
            return;
          let paramNameArr = filter.uniqueName.split('].[');
          let dimension = paramNameArr[0].replace('[', '');
          let hierarchy = paramNameArr[1].replace('[', '');
          let levelName = paramNameArr[2].replace(']', '');
          this.dataHandleSer.getAllValueOfFilter({
            connection: filter.cube.connection,
            catalog: filter.cube.catalog,
            schema: filter.cube.schema,
            name: filter.cube.name,
            dimension: dimension,
            hierarchy: hierarchy,
            level: levelName,
            fromTemplateList: this.fromTemplateList
          }).subscribe(resp => {
            console.log("多余查询!!!");
            let members = (resp && resp.data) || {};
            let distinctMember = [];

            for (let m of members) {
              // let index=distinctMember.findIndex(d=>{if(d.name==m.name) return true;});
              // if(index==-1){
              // if(m.uniqueName==pageF.defaultVal){
              //   m['selected']=true;
              // }
              distinctMember.push(m);
              // }
            }
            filter['data'] = distinctMember;
          })
        })
      }
      panel['showFilterOpt'] = showFilterOpt;
    })
  }

  changeCurPage(page: Page, e: Event) {
    let target = <HTMLLIElement>e.target;
    this.setCurBorderBottomPosition(target);
    this.initPage(page.pageID);
    // this.curPage = page;
    // this.safeUrl=this.sanitizer.bypassSecurityTrustResourceUrl(this.curPage.href);
  }

  showPreview(e: MouseEvent, panel: Panel) {
    if (panel.panelType != PanelType.table) {
      return;
    } else {
      this.selectPanelFilters = panel.singlePanelFilters;
      let card = panel.data as Card;
      this.panelContentList.forEach(pc => {
        if (pc.panelID == panel.panelID) {
          console.log('show layer');
          this.curPanelQueryType = pc.queryType;
          card['defaultParams'] = pc.defaultParams;
          card['params'] = pc.selectParams;
          card.dataSetId = card.dataSetId;
        }
      })
      panel.data = card;
    }
    let self = this;
    return function () {
      //self.curPanel = panel;
      // console.log(e.target);
      let target = <HTMLElement>e.target,
        pNode = <HTMLElement>target.parentNode;
      let gridsterNode = document.getElementById('panels_list');
      // console.log(pNode.getBoundingClientRect())
      // console.log(gridsterNode.getBoundingClientRect())
      self.previewFilterPos.top = pNode.getBoundingClientRect().top - gridsterNode.getBoundingClientRect().top;
      self.previewFilterPos.left = pNode.getBoundingClientRect().left - gridsterNode.getBoundingClientRect().left + pNode.getBoundingClientRect().width;
      // if(panel.panelType==PanelType.table) {
      //   this.selectPanelFilters = panel.singlePanelFilters;
      // }
      return panel;
    }

  }

  cancelBubble(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  showLayer(e: MouseEvent, key: string, cancleBubble = true, panelIndex?: number, callback?: any) {
    //let panel:Panel;
    if (cancleBubble) {
      this.cancelBubble(e);
    }
    if (key == 'panelFilterFlag') {
      this.showFilterIndex = panelIndex;
    }
    this.layerFlags[key] = true;
    // 现存问题：只能显示 无法隐藏此模板 设置模板显示隐藏
    // this.layerFlags[key] = !this.layerFlags[key];
    this.closeOtherLayer(key);
    if (callback && typeof callback === "function") {
      this.curPanel = callback();
    }
  }

  /**
   * 关闭弹层
   * @param str 参数为空时关闭所有的弹层
   */
  closeOtherLayer(str: string = '', e?: any) {
    for (let key in this.layerFlags) {
      if (key !== str) {
        this.layerFlags[key] = false;
      }
    }

  }

  onPanelSizeChange(panel: Panel, index: number, event: NgGridItemEvent): void {
    // console.warn("changePanelSize",panel,index,event);
  }

  onResizeStop(panel: Panel, index: number, event: NgGridItemEvent): void {
    // console.log("onResizeStop",panel,index,event.width,event.height);
  }

  // updateItem(index: number, event: NgGridItemEvent): void {
  //   // Do something here
  // }

  onDrag(index: number, event: NgGridItemEvent): void {
    // Do something here
  }

  onResize(index: number, event: NgGridItemEvent): void {
    // Do something here
  }

  setFiltersFn({ selectParams, panelId }) {
    // console.log('panelID:',this.panelContent);
    // if (item.cardIDs) {
    //   for (let cardId of item.cardIDs) {
    this.curPage.panels.forEach(panel => {
      if (panel.panelID == panelId) {
        let data = panel.data;
        let card = new Card();
        card.cardId = data.cardId;
        card.cardName = data.cardName;
        card.dataSetId = data.dataSetId;
        card['params'] = selectParams;
        panel.data = card;
      }
      // if (panel.panelType == PanelType.table) {
      //   let data = panel.data;
      //   if (data.cardId == cardId) {
      //     let card = new Card();
      //     card.cardId = data.cardId;
      //     card.cardName = data.cardName;
      //     card.dataSetId = data.dataSetId;
      //     card['params'] = selectParams;
      //     panel.data = card;
      //   }
      // }
    })

    //   }
    // }
  }
  searchRunFn({ selectParams, panelId }) {
    this.panelContentList.forEach(pc => {
      if (pc.panelID == panelId) {
        console.log('selectParams:', selectParams);
        pc.searchRun({ searchParams: selectParams });
      }
    })
  }
  refreshPanelFn(panelId: string) {
    console.log('refresh:', panelId);
    this.curPage.panels.forEach(panel => {
      if (panel.panelID == panelId) {
        let data = panel.data;
        let card = new Card();
        card.cardId = data.cardId;
        card.cardName = data.cardName;
        card.dataSetId = data.dataSetId;
        card['params'] = data['params'];
        card.queryType = data.queryType;
        card.content = data.content;
        panel.data = card;
      }
    })

  }
  panelRunFn(helper) {
    this.panelContentList.forEach(pc => {
      if (pc.panelID == this.drillPanelID) {
        pc.run(helper);
      }
    })

  }

  //触发下钻或切片操作
  showSectionOrDrillFn({ drill, section, drillOptions, drillPanelID }) {
    this.drillPanelID = drillPanelID;
    if (drill) {
      this.drilldownCom.showModal(drillOptions);
    } else if (section) {
      this.sectionDimension.show(drillOptions);
    }
  }

  setOptionFn({ optionType, panelId }) {

    if (optionType == 'drill') {
      this.panelContentList.forEach(pc => {
        if (pc.panelID == panelId) {
          pc.drill = optionType.drill;
          pc.section = optionType.section;
        }
      })
    } else {
      this.panelContentList.forEach(pc => {
        if (pc.panelID == panelId) {
          pc.drill = optionType.drill;
          pc.section = optionType.section;
        }
      })
    }
    this.curPanel['drill'] = optionType.drill;
    this.curPanel['section'] = optionType.section;
  }
  changeShowType(panelID: string, showType: string) {
    this.curPage.panels.forEach(panel => {
      if (panel.panelID == panelID) {
        console.log('showType:', showType);
        panel.dataShowType = showType;
      }
    })
  }

  exportPDF() {
    Loading.addCircleLoading();
    var nodesToRecover = [];
    var nodesToRemove = [];
    // var tableArr=[];
    let targetElement = document.querySelector('#dsPreView');
    let iElement = targetElement.getElementsByTagName('i');
    while (iElement.length > 0) {
      var parentNode = iElement.item(0).parentElement;
      nodesToRecover.push({
        parent: parentNode,
        child: iElement.item(0)
      });
      parentNode.removeChild(iElement.item(0));
    }
    let tableContainer = targetElement.getElementsByClassName('show_table_box');

    for (let i = 0; i < tableContainer.length; i++) {
      var tableObj = tableContainer.item(i);
      tableObj.setAttribute('style', 'overflow:hidden');
    }
    let svgs = targetElement.getElementsByTagName('svg');
    while (svgs.length > 0) {
      var parentNode = svgs.item(0).parentElement;
      var svg = parentNode.innerHTML;
      var canvas = document.createElement('canvas');
      canvg(canvas, svg);
      nodesToRecover.push({
        parent: parentNode,
        child: svgs.item(0)
      });
      parentNode.removeChild(svgs.item(0));
      nodesToRemove.push({
        parent: parentNode,
        child: canvas
      });
      parentNode.appendChild(canvas);
    }
    let $this = this;
    html2canvas(targetElement, {
      onrendered: function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        canvas.toBlob(function (blob) {
          nodesToRemove.forEach(function (pair) {
            pair.parent.removeChild(pair.child);
          });

          nodesToRecover.forEach(function (pair) {
            pair.parent.appendChild(pair.child);
          });
          for (let i = 0; i < tableContainer.length; i++) {
            var tableObj = tableContainer.item(i);
            tableObj.setAttribute('style', '');
          }
          var data = canvas.toDataURL();
          var docDefinition = {
            content: [{
              image: data,
              width: 500,
            }]
          };
          pdfMake.createPdf(docDefinition).download($this.dashboard.dashboardName + '-' + $this.curPage.pageName + '.pdf');
          nodesToRecover.splice(0, nodesToRecover.length);
          nodesToRemove.splice(0, nodesToRemove.length);
          Loading.removeLoading();
        });
      }
    });
  }
  private setCurBorderBottomPosition(ele: HTMLLIElement) {
    let { left, width } = ele.getBoundingClientRect();
    if (this.isTemplate && !this.isPreview) {
      left -= 280;
    }
    this.curBorderBottomPosition = { left, width };
    //this.renderer.setElementStyle(this.curBorderBottom.nativeElement,'width',`${width}px`);
    //this.renderer.setElementStyle(this.curBorderBottom.nativeElement,'left',`${left}px`);
  }
  private resetCurPageStyle() {
    setTimeout(() => {
      let pageElements = this.pageList.nativeElement;
      let firstPageEle = pageElements.getElementsByTagName('li')[0];
      this.setCurBorderBottomPosition(firstPageEle);
    }, 500);
  }

  toEditDashboard(dashId) {
    this.router.navigate([ '/dashboard/info/update/'+dashId ]);
  }
}
