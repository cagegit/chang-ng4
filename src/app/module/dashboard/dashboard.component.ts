/**
 * Created by fengjj on 2016/12/21.
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  ChartInfo,
  Dashboard,
  DashType,
  Page,
  PageFilter,
  Panel,
  PanelFilter,
  PanelType,
  SinglePanelFilter
} from '../../common/model/dashboard.model';
import { DashboardService } from "../../common/service/dashboard.service";
import { DataSet } from "../../common/model/data-set.model";
import { ActivatedRoute, Router } from "@angular/router";
import { PAGES } from './data';
import { CardService } from "../../common/service/card.service";
import { Card } from '../../common/model/card/card.model';
import { Error } from '../../common/model/Error';
import { GridsterComponent } from "../../gridster/gridster.component";
import { ModalDirective } from "ngx-bootstrap";
import { AppNotification } from "../../app.notification";
import { DragulaService } from "ng2-dragula/ng2-dragula";
import { ShowChart } from "../card/card.showchart";
import { ResourcePermission } from "../../common/model/resource-permission.model";
import { Cube } from "../../common/model/card/schema.cube";
import { NgGridItemConfig, NgGridItemEvent } from "../../ng-grid";
import { LayoutUtil } from "./layout-util";
import * as query from "../../common/model/card/card.query.template";
import { FilterCondition } from "../../common/model/card/card.query.template";
import { TemplateHelper } from "../card/templateHelper";
import { flyIn } from '../../animations';
import { SIZES } from "../../common/size-in-documnet";
import { DomSanitizer } from "@angular/platform-browser";
import { DataHandleService } from '../../changan/data.handle.service';
import { ChangService } from '../../changan/chang.service';

@Component({
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html",
  animations: [ flyIn ],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements AfterViewInit,OnInit {
  @ViewChild('dashboardBox') dashboardBox:ElementRef;
  @ViewChild('dataSetList') dataSetList:ElementRef;
  @ViewChild('gridster') gridster:GridsterComponent;
  @ViewChild('deletePageConfirm') deletePageConfirm:ModalDirective;
  isFixed = false;
  minHeight:number;
  dashboardLeftStyles ={
    position:''
  }
  public _gridContainer:ElementRef;
  @ViewChild('gridContainer')
  set gridContainer(value:ElementRef){
    this._gridContainer = value;
    if(this.gridContainer){
      let height = (document.documentElement.clientHeight || document.body.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT - 122 -20;
      //this.renderer.setElementStyle(this.gridContainer.nativeElement,'height',`${height}px`);
    }
  }
  get gridContainer(){
    return this._gridContainer;
  }
  panelHeight:number;
  pages:Page[] = [];
  curPage:Page;
  deletePage:Page;
  curPanel:Panel;
  datasetList:DataSet[] = [];
  dashboardId:string;
  cardList:Card[];
  layoutType:string;
  cube:Cube;
  selectPanelFilters = new Array<SinglePanelFilter>();
  panelTypeBoxPos = {
    top: 0,
    left: 0
  };
  panelFilterBoxPos = {
    top: 0,
    left: 0
  };
  panelCharts:{[key:string]:ChartInfo} = {};
  //_dataSetID:string;
  isCardGetting = false;
  // 设置数据集ID
  set dataSetID(id:string) {
    this.isCardGetting = true;
    this.dataHandleSer.getCards(id).subscribe((res) => {
      this.isCardGetting = false;
      if(res && res.data && Array.isArray(res.data.list)) {
        const cardList  = res.data.list;
        this.cardList = cardList;
        if(cardList&&cardList.length>0) {
          let thinQuery = JSON.parse(cardList[0].content.replace(/\n/g, ' ')) as query.QueryTemplate;
          this.cube = thinQuery.cube;
        }
      } else {
        this.cardList=null;
      }
    },(err)=>{
      console.log(err);
      this.cardList=null;
      this.isCardGetting = false;
    });
  }
  // 设置menuId
  isGettingTable = false;
  set menuID(id:string) {
    this.isGettingTable = true;
    this.changSer.getTablesByMenuId(id).subscribe(res => {
      this.isGettingTable = false;
      if(res && res.data && Array.isArray(res.data.tableList)) {
        // 过滤启用的表格
        this.tableList = res.data.tableList.filter(item => item.status===1);
      }
    },err => {
      console.log(err);
      this.isGettingTable = false;
      this.tableList = [];
    });
  }


  // drag and scale
  gridsterOptions:any = {
    lanes: 12,
    direction: 'vertical',
    dragAndDrop: true,
    sizeScale: true
  }
  showFilterIndex = -1;
  layerFlags = {
    selectYearFlag: false,
    pageFilterFlag: true,
    //setItemFlag:false,
    //setOrganizeFlag:false,
    //setTimeFlag:false,
    layoutListFlag: false,
    panelTypeFlag: false,
    panelFilterFlag: false
  };
  dashboard:Dashboard = new Dashboard();
  PERMISSION_TYPE:any = ResourcePermission.PERMISSION_TYPE;
  RESOURCE_TYPE_DASHBOARD:string = ResourcePermission.RESOURCE_TYPE.DASHBOARD;
  /**------------------------------------------------------------------------------------------------------------------布局开始**/
  CONTAINER_CONFIG:any = Object.assign({}, LayoutUtil.CONTAINER_EDIT_CONFIG);
  usedCards:string[]=[]; // 已使用的card
  usedTables:string[] = []; // 已使用的table

  // 菜单配置项
  menuList = [];
  tableList = [];
  constructor(private route:ActivatedRoute ,private renderer:Renderer,private dashboardService:DashboardService,private cardService:CardService,private router:Router,private appNotification:AppNotification,private dragulaService: DragulaService,private sanitizer: DomSanitizer
  ,private dataHandleSer: DataHandleService, private changSer: ChangService){
    document.body.addEventListener('click',() => {
      this.closeOtherLayer();
    })
    this.minHeight = (document.documentElement.clientHeight || document.body.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT - SIZES.HEAD_DASHBOARD_LIST_HEIGHT  - 152;
    //document.body.addEventListener('scroll',this.scrollFn.bind(this));
    for (let page of PAGES) {
      let p = Page.build(page);
      this.pages.push(p)
    }
    this.dragInit();
  }

  @HostListener('document:scroll',['$event'])
  onScroll(e:Event){
    let target = e.target as any;
    let scrollEle = target.scrollingElement;
    let top = scrollEle.scrollTop;
    if(top > (SIZES.HEAD_HEIGHT + SIZES.HEAD_DASHBOARD_LIST_HEIGHT + 88)){
      this.isFixed = true;
    }else {
      this.isFixed = false;
    }
  }
  /**
   * 重置布局
   */
  resetLayout() {
    this.curPage.initPannels([]);
    this.curPage.href="";
  }

  /**
   * 添加一个panel
   */
  addPanel() {
    this.curPage.addPanel();
    this.appNotification.success("添加成功!");
  }

  /**
   * 创建面板布局
   * @param gridItemConfigArr
   */
  createPanelLayout(url:string,gridItemConfigArr:NgGridItemConfig[]) {
    if(url){
      this.curPage.href=url;
      this.safeUrl=this.sanitizer.bypassSecurityTrustResourceUrl(this.curPage.href);
    }else{
      this.curPage.initPannels(gridItemConfigArr);
    }
  }
  public safeUrl : any;
  public pageType;
  pageTypeChange(pageType:string){
    // console.log("changePageType:",pageType);
    this.pageType=pageType;
  }

  onPanelSizeChange(panel:Panel, index:number, event:NgGridItemEvent):void {
    // console.warn("changePanelSize",panel,index,event);
  }

  // onResizeStop(panel : Panel,index: number, event: NgGridItemEvent): void {
  //
  //    console.log("onResizeStop",panel,index,event.width,event.height);
  //   console.log("onResizeStop",arguments);
  // }


  onResizeStop(item : any): void {
    // console.log("onResizeStop",arguments);
  }

  onItemChange(): void {
    //console.warn("arguments:",arguments);
  }

  onDragStop(panel : Panel,event : any) {
    console.log("onDragStop:",arguments);
    Panel.sort(this.curPage.panels);
  }

  /**------------------------------------------------------------------------------------------------------------------布局结束**/

  ngOnInit() {
    this.panelHeight = (document.body.clientHeight || document.documentElement.clientHeight) - 75 - 45 - 144;
    this.route.params.subscribe((params:any) => {
      // 获取数据集列表
      this.dataHandleSer.getDatasetList().subscribe((res) => {
        if(res && res.data && Array.isArray(res.data)) {
          // const datasetList = res.data as DataSet[];
          this.datasetList = res.data as DataSet[];
          if (params.id) {
            this.dashboardId = params.id;

            this.dataHandleSer.getDashboardById(params.id).subscribe((res) => {
              this.dashboard = Dashboard.build(res.data);
              this.changePage(this.dashboard.content[0]);
            }, (err:Error)=> {
              this.appNotification.error(err.errMsg);
            })
          } else {
            this.createPage();
          }
        }

      });
      // 获取菜单列表
      this.changSer.getMenuList().subscribe(res => {
        // console.log(res.data);
        if(res && Array.isArray(res.data) && res.data.length>0) {
          this.menuList = res.data;
        }
      },err => {
        this.appNotification.error(err || err.errMsg);
        console.log(err);
      });
    });
  }

  ngAfterViewInit() {
    //computeMinHeight.setMinHeight(this.renderer, this.dashboardBox.nativeElement, false);
  }

  dragInit() {
    let panel = this.dragulaService.find('panel');
    if (panel) {
      this.dragulaService.destroy('panel');
    }
    this.dragulaService.setOptions('panel',
      {
        copy: true,
        moves: function (el, source, handle, sibling) {
          if (source.getAttribute('data-move') == 0) {
            return false;
          } else {
            return true;
          }
          // elements are always draggable by default
        },
        // accepts: function (el, target, source, sibling) {
        //   let tDataDrag = target.getAttribute('data-drag'),
        //     sDataDrag = source.getAttribute('data-drag');
        //   return tDataDrag === sDataDrag; // elements can be dropped in any of the `containers` by default
        // },
        removeOnSpill: false
      }
    );
    //dragulaService.setOptions('panel1',{copy:true})
    this.dragulaService.drag.subscribe((value) => {
      console.log("拖起来:",value);
      this.onDrag(value.slice(1));
    });
    this.dragulaService.drop.subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    this.dragulaService.over.subscribe((value) => {
      this.onOver(value.slice(1));
    });
    this.dragulaService.out.subscribe((value) => {
      this.onOut(value.slice(1));
    });
    this.dragulaService.dragend.subscribe((value) => {
      this.onDragEnd(value.slice(1));
    });
  }

  //removeLine(gridster) {
  //  gridster.setOption('lanes', --this.gridsterOptions.lanes)
  //    .reload();
  //}
  //addLine(gridster) {
  //  gridster.setOption('lanes', ++this.gridsterOptions.lanes)
  //    .reload();
  //}
  setWidth(panel:Panel, size:number, e:MouseEvent) {
    // console.log('width');
    e.stopPropagation();
    e.preventDefault();
    if (size < 1) {
      size = 1;
    }
    panel.panelW = size;
    return false;
  }

  setHeight(panel:Panel, size:number, e:MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (size < 1) {
      size = 1;
    }
    panel.panelH = size;
    return false;
  }

  /**
   * 选择报表展开收起
   * @param e
   */
  changeFolderState(e:any) {
    let b;
    let target = <any>e.target;
    if (target.className.indexOf('grade_fold') > -1) {
      b = false;
    } else {
      b = true;
    }
    this.renderer.setElementClass(target, 'grade_fold', b);
  }

  /**
   * 筛选条件 年的配置
   */
  showLayer(e:MouseEvent, key:string, cancleBubble = true, panelIndex?:number, callback?:any) {
    if (cancleBubble) {
      this.cancelBubble(e);
    }
    if (key == 'panelFilterFlag') {
      this.showFilterIndex = panelIndex;
    }
    this.layerFlags[key] = true;
    this.closeOtherLayer(key);
    if (callback && typeof callback === "function") {
      callback();
    }
  }

  /**
   * 关闭弹层
   * @param str 参数为空时关闭所有的弹层
   */
  closeOtherLayer(str:string = '') {
    for (let key in this.layerFlags) {
      if (key !== str) {
        this.layerFlags[key] = false;
      }
    }
  }

  /**
   * 阻止冒泡
   * @param e
   */
  cancelBubble(e:MouseEvent) {
    // console.log("阻止冒泡:", e);
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   * page tab change
   * @param page click pagetab
   */
  changePage(page:Page) {
    this.curPage = page;
    console.log(this.curPage);
    // if(this.curPage.href){
    //   // console.log("safeUrl:",this.curPage.href);
    //   // // this.safeUrl=this.sanitizer.bypassSecurityTrustResourceUrl(this.curPage.href);
    //   // console.log("safeUrl:",this.safeUrl);
    // }
    // let cube=new Cube();
    this.dataSetID = this.curPage.dataSetID;
    this.menuID = this.curPage.menuId;
    if(this.usedCards){
      this.usedCards.splice(0,this.usedCards.length);
    }else{
      this.usedCards=[];
    }
    if(this.usedTables){
      this.usedTables.splice(0,this.usedTables.length);
    }else{
      this.usedTables=[];
    }
    this.curPage.panels.forEach((panel:Panel)=>{
      if(panel.panelType==0&&panel.content.hasOwnProperty('cardId')){
        let card=panel.content as Card;
        this.usedCards.push(card.cardId);
      }
      if(panel.panelType==PanelType.config && panel.content.hasOwnProperty('cardId')) {
        let card=panel.content as Card;
        this.usedTables.push(card.cardId);
      }
    });
  }

  /**
   * page tab change
   * @param page click pagetab
   */
  changeTab(page:Page) {
    console.log("changeTab:",page.pageName);
    this.dashboard.content=this.dashboard.content.map((p:Page) => {
      if(p.pageID==this.curPage.pageID){
        return this.curPage;
      }else{
        return p;
      }
    });
    this.changePage(page);
  }

  public count:number=0;
  tabClick(page:Page,e:MouseEvent){
    this.count+=1;
    if(this.dbClickTimer){
      clearTimeout(this.dbClickTimer);
    }
    this.dbClickTimer=setTimeout(()=>{
      if(this.count==1){
          console.log("单击111");
          this.changeTab(page);
        let target = <any>e.target;
        this.renderer.setElementClass(target.parentNode, 'cur', true);
      }
      if(this.count==2){
        console.log("双击222");
        this.showPageNameInputBox(e);
      }
      this.count=0;
    },300);
  }



  /**
   * 创建dashboard页面
   */
  createPage() {
    let panels:Panel[] = [];
    let p = <any>{pageID: this.createUUID(), pageName: '新建页面', panels: panels};
    if(this.datasetList.length>0) {
      p.dataSetID = this.datasetList[0].dataSetID;
    }
    if(this.menuList.length>0) {
      p.menuId = this.menuList[0].id;
    }
    let page = Page.build(p);
    this.dashboard.content.push(page);
    this.dashboard.content=this.dashboard.content.slice(0);
    this.curPage = page;
    console.log('newPage:',this.curPage);
    this.dataSetID = this.curPage.dataSetID;
  }

  /**
   *删除页面时,显示确认页面
   */
  showDeleteConfirmPage(e:MouseEvent, page:Page) {
    this.cancelBubble(e);
    this.deletePage = page;
    this.deletePageConfirm.show();

    let target = <any>e.target;
    // let width = target.getBoundingClientRect().width;
    // let inputNode = target.parentNode.getElementsByTagName('input')[0];
    // this.renderer.setElementStyle(inputNode, 'width', `${width}px`);
    this.renderer.setElementClass(target.parentNode, 'cur', true);

  }

  /**
   * 删除页面 点击确认按钮删除页面
   * @param e
   */
  confirmRemove(e:MouseEvent) {
    this.removePage(e, this.deletePage);
    this.deletePage = null;
    this.deletePageConfirm.hide();
  }

  /***
   *删除页面 点击取消按钮
   */
  cancelRemove(e:MouseEvent) {
    this.deletePage = null;
    this.deletePageConfirm.hide();
  }

  /***
   * 移除面板页面
   * @param page
   */
  removePage(e:MouseEvent, page:Page) {
    this.cancelBubble(e);
    this.dashboard.content = this.dashboard.content.filter((p:Page) => {
      return p.pageID !== page.pageID;
    })
    if (page.pageID == this.curPage.pageID) {
      this.changePage(this.dashboard.content[0]);
      //this.curPage = this.pages[0];
    }
  }

  /***
   * 删除当前页面的某个panel
   * @param panel
   */
  removePanel(panel:Panel) {
    this.clearPanel(panel);
    this.curPage.removePanel(panel.panelID);


  }

  public dbClickTimer;
  /***
   * 显示page重命名input 隐藏span
   * @param e
   */
  showPageNameInputBox(e:MouseEvent) {
    this.cancelBubble(e);
    let target = <any>e.target;
    let width = target.getBoundingClientRect().width;
    let inputNode = target.parentNode.getElementsByTagName('input')[0];
    this.renderer.setElementStyle(inputNode, 'width', `${width}px`);
    this.renderer.setElementClass(target.parentNode, 'input_state', true);
    inputNode.focus();
    inputNode.select();
  }

  /***
   * 重命名 page
   * @param e
   * @param page
   * @param name
   */
  renamePage(e:MouseEvent, page:Page, name:string) {
    page.changePageName(name);
    let target = <any>e.target;
    let spanNode = target.parentNode.getElementsByTagName('span')[0];
    this.renderer.setElementClass(target.parentNode, 'input_state', false);
  }
  // 重命名 当前页
  renameCurPage(e:MouseEvent, page:Page, name:string) {
    page.changePageName(name);
  }

  /***
   * 创建panels
   * @param layoutType
   * @param row
   * @param col
   */
  /*  createPanelLayout(layoutOpt:any){
   if(layoutOpt.layoutType === 'normal'){
   this.curPage.addPanels(this.gridsterOptions.lanes,layoutOpt.row,layoutOpt.col,'')
   }else {
   this.curPage.addSpecialPanels(this.gridsterOptions.lanes,layoutOpt.layoutType)
   }
   //this.curPage = this.curPage.clone(this.curPage);
   //this.closeOtherLayer();
   }*/


  /**
   * 修改panel 类型
   * @param e
   * @param type
   */
  //changePanelType(e:any,panel:Panel,type:PanelType){
  //  this.cancelBubble(e);
  //  //panel.changeType(type);
  //
  //  //this.dragulaService.add(`panel${type}`,'')
  //  this.clearPanel(panel);
  //}

  /**
   *某个panel操作 改变当前操作的panel
   * @param e
   * @param panel
   * @param panelTypeFlag 为true时证明操作panel类型 否则为 panel 筛选
   */
  panelOperateFn(e:MouseEvent, panel:Panel, panelTypeFlag:boolean) {
    let self = this;
    this.selectPanelFilters = panel.singlePanelFilters;
    self.curPanel = panel;
    let target = <any>e.target;
    let parentNode = document.getElementById('panels_list');
    if (panelTypeFlag) {

        let pTop = parentNode.getBoundingClientRect().top,
        pLeft = parentNode.getBoundingClientRect().left;
        let tParentNode = target.parentNode.parentNode,
        targetTop = tParentNode.getBoundingClientRect().top,
        targetLeft = tParentNode.getBoundingClientRect().left;
      self.panelTypeBoxPos.left = targetLeft - pLeft + 10;
      self.panelTypeBoxPos.top = targetTop - pTop + 35;
    } else {
        let pNode = <HTMLElement>target.parentNode;
      self.panelFilterBoxPos.top = pNode.getBoundingClientRect().top - parentNode.getBoundingClientRect().top + 35;
      self.panelFilterBoxPos.left = pNode.getBoundingClientRect().left - parentNode.getBoundingClientRect().left + pNode.getBoundingClientRect().width - 181;
    }
  }


  /***
   * 改变panel 类型
   * @param type
   */
  changePanelTypeFn(type:PanelType) {
    this.curPanel.changeType(type);
    this.clearPanel(this.curPanel);
    this.closeOtherLayer();
  }

  /***
   * 切换dataSet
   * @param e
   * @param id
   */
  changeDataSet(e:any, id:string) {
    this.dataSetID = id;
    // this.clearPage();
    this.curPage.changeDataSetID(id);
  }
  /***
   * 切换dataSet
   * @param e
   * @param menuId
   */
  changeMenu(e:any, menuId:string) {
    this.menuID = menuId;
    // this.clearPage();
    this.curPage.changeMenuID(menuId);
  }

  /***
   * 清空page
   */
  clearPage() {
    this.curPage.removeAllPanels();
    this.curPage.pageFilters = [];
    this.curPage.href="";
  }

  /**
   * 添加一个panel
   */
  /*  addPanel(){
   this.curPage.addPanel(this.gridsterOptions.lanes);
   setTimeout(()=>{this.gridster.reload();},0)
   }*/
  clearPanel(panel:Panel) {
    let data = Object.assign({}, panel.data);
    // console.log('curPanel', data)
    if(data && panel.data.cardId) {
      this.removeCardIDFromPageFilter(panel.data.cardId);
      if(panel.panelType == PanelType.config) {
        let index=this.usedTables.findIndex(uc=>{
          if(panel.data.cardId==uc)
            return true;
        });
        if(index!=-1){
          this.usedTables.splice(index,1);
        }
      } else {
        let index=this.usedCards.findIndex(uc=>{
          if(panel.data.cardId==uc)
            return true;
        });
        if(index!=-1){
          this.usedCards.splice(index,1);
        }
      }
    }
    panel.clear();
  }

  removeCardIDFromPageFilter(cardID:string) {
    this.curPage.removeCardIDFromPageFilter(cardID);
    // console.log('remove cardId', this.curPage)
  }

  /***
   * 修改dashboard 的名字
   * @param e
   * @param value
   */
  changeDashboardName(e:any, value:string) {
    this.dashboard.changeName(value);
  }

  /**
   * 创建uuid
   * @returns {string}
   */
  clickLayoutFn(e:MouseEvent, layout:string) {
    this.layoutType = layout;
  }

  clearLayoutType() {
    this.layoutType = '';
  }

  saveDashboard(e:MouseEvent) {
    let dashboard = this.dashboard.clone();
    let pages = dashboard.content as Page[];
    // pages=pages.map((page : Page)=>{
    //   Panel.sort(page.panels);
    //   return page;
    // });

    let arr=[];

    pages[0].panels.forEach((temp: Panel)=>{
        arr.push(`{'dragHandle': '.dev-drag','sizex': ${temp.config.sizex}, 'sizey': ${temp.config.sizey}, 'col': ${temp.config.col}, 'row': ${temp.config.row}}`);
    });
    let template : string='['+arr.join(",")+']';
    //console.warn("原始配置文件:",pages[0].panels);
    //console.warn("模版:",template);
    let createFlag = this.dashboardId?false:true;
    dashboard.dataSetIDs = pages.map((page:Page) => {
      return page.removeUseLessPageFilter().dataSetID;
    });
    dashboard = dashboard.contentToString();
    dashboard.templateID=null;
    console.log(dashboard);
    this.dataHandleSer.saveDashboard(dashboard, createFlag).subscribe((res)=> {
      if(res && res.data) {
        let dashboard = Dashboard.build(res.data);
        this.router.navigate(['dashboard/info',dashboard.dashboardID]);
      }
    }, (err:Error)=> {
      this.appNotification.error(err.errMsg);
    });
  }

  sortPanels(){
    let pages = this.dashboard.content as Page[];
    pages=pages.map((page : Page)=>{
       Panel.sort(page.panels);
      return page;
    });
  }



  /**
   * 创建page 筛选条件
   * @param filters
   * @param cardID
   */
  createPageFilterFn({filters, cardID, cube}) {
    this.cube = cube;
    if (filters && (filters.length > 0) && cardID) {
      for (let pageFilter of filters) {
        this.changePageFilter(pageFilter, cardID, cube);
        // this.curPage.changePageFilter(pageFilter.name,cardID);
      }
    } else { //编辑时 请求失败是将对应的cardID从pageFilter.cardIDs中移除
      this.curPage.removeCardIDFromPageFilter(cardID);
    }
  }

  /**
   * 添加pageFilter
   * @param name
   * @param cardID
   */
  changePageFilter(filterCondition:FilterCondition, cardID:string, cube:Cube) {
    let pageF;
    // console.log('default load');
    for (let pageFilter of this.curPage.pageFilters) {
      if (pageFilter.uniqueName === filterCondition.name) {
        pageF = pageFilter;
      }
      // else{
      //   let index = pageFilter.cardIDs.indexOf(cardID);
      //   if(index>-1){
      //     pageFilter.cardIDs.splice(index,1);
      //   }
      // }
    }
    if (pageF) {
      if (pageF.cardIDs.indexOf(cardID) === -1) {
        pageF.cardIDs.push(cardID);
      }
      // let gnArr = pageF.groupName.split('.');
      // let dimension = gnArr[0];
      // let hierarchy = gnArr[1];
      let paramNameArr =pageF.uniqueName.split('].[');
      let dimension = paramNameArr[0].replace('[', '');
      let hierarchy = paramNameArr[1].replace('[', '');
      let levelName = paramNameArr[2].replace(']', '');
      this.dataHandleSer.getAllValueOfFilter({
        connection: cube.connection,
        catalog: cube.catalog,
        schema: cube.schema,
        name: cube.name,
        dimension: dimension,
        hierarchy: hierarchy,
        level:levelName,
        fromTemplateList:false
      }).subscribe(resp=> {
        let members = (resp && resp.data) || {};
        let distinctMember = [];

        for (let m of members) {
          let index = distinctMember.findIndex(d=> {
            if (d.name == m.name) return true;
          });
          if (index == -1) {
            if (m.uniqueName == pageF.defaultVal) {
              m['selected'] = true;
            }
            distinctMember.push(m);
          }
        }
        pageF['data'] = distinctMember;
      })
    } else {
      let pFilter = new PageFilter();
      let paramNameArr =filterCondition.name.split('].[');
      let dimension = paramNameArr[0].replace('[', '');
      let hierarchy = paramNameArr[1].replace('[', '');
      let levelName = paramNameArr[2].replace(']', '');
      pFilter.name = filterCondition.showName;
      pFilter.groupName = dimension + '.' + hierarchy;
      pFilter.uniqueName = filterCondition.name;
      pFilter.cardIDs.push(cardID);
      this.dataHandleSer.getAllValueOfFilter({
        connection: cube.connection,
        catalog: cube.catalog,
        schema: cube.schema,
        name: cube.name,
        dimension: dimension,
        hierarchy: hierarchy,
        level: levelName,
        fromTemplateList:false
      }).subscribe(resp=> {
        let members = (resp && resp.data) ||{};
        let distinctMember = [];

        for (let m of members) {
          let index = distinctMember.findIndex(d=> {
            if (d.name == m.name) return true;
          });
          if (index == -1) {
            distinctMember.push(m);
          }
        }
        pFilter['data'] = distinctMember;
      })
      this.curPage.pageFilters.push(pFilter);
    }
  }

  addDataFn(data:string, panel:Panel) {
    // console.log('img', data);
    // console.log('panel img', panel);
    panel.data = data;
    // console.log(panel);
  }

  public cardToString(card) {
    return JSON.stringify(card);
  }

  public createUUID():string {
    let uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
    return uuid;
  }

  public hasClass(el:any, name:string) {
    return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
  }

  public addClass(el:any, name:string) {
    if (!this.hasClass(el, name)) {
      el.className = el.className ? [el.className, name].join(' ') : name;
    }
  }

  public removeClass(el:any, name:string) {
    if (this.hasClass(el, name)) {
      el.className = el.className.replace(new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)', 'g'), '');
    }
  }

  public onDrag(args) {
    let [e, el] = args;
    this.removeClass(e, 'ex-moved');
  }

  public onDrop(args) {
    let [e,toContainer,fromContainer] = args;
    // console.log('args:', args);
    if (toContainer == null || toContainer == fromContainer)
      return;
    let panelID = toContainer.getAttribute('data-panelID');
    let panel = this.curPage.getPanelById(panelID);
    if(!panel){
      console.log('panel:',panel);
      return;
    }
    let data;
    let dashType = e.getAttribute('data-dashType');// 可配置图表类型
    console.log('dashType:'+dashType);
    if(dashType ==='conf') {
      let cardID = e.getAttribute('data-cardID');
      let cardName = e.getAttribute('data-cardName');
      let defaultTime = e.getAttribute('data-defaultTime');
      //加入已使用的数组
      if(this.usedTables.indexOf(cardID)==-1){
        this.usedTables.push(cardID);
      }
      console.log(this.usedTables);
      data = new Card();
      data.cardId=cardID;
      data.cardName=cardName;
      data.content = defaultTime;
      panel.panelName=cardName;
      panel.data=data;
      panel.panelType = PanelType.config; // 重置paneltype
    } else {
      switch (panel.panelType) {
        case PanelType.table:
          let cardID = e.getAttribute('data-cardID');
          let cardName = e.getAttribute('data-cardName');
          let dataSetID = e.getAttribute('data-dataSetID');
          let queryType=e.getAttribute('data-queryType');
          let content=e.getAttribute('data-content');
          //加入已使用的数组
          if(this.usedCards.indexOf(cardID)==-1){
            this.usedCards.push(cardID);
          }
          // let card=e.getAttribute('data-card') as Card;
          data = new Card();
          data.cardId=cardID;
          data.cardName=cardName;
          data.content=content;
          data.queryType=queryType;
          data.dataSetId=dataSetID;
          panel.panelName=cardName;
          panel.dataSetId=dataSetID;
          panel.data=data;
          // data.cardId = cardID;
          // data.cardName = cardName;
          // data.dataSetId = dataSetID;
          // data.queryType=queryType;
          // panel.panelName = cardName;
          // panel.dataSetId=dataSetID;
          // panel.data = data;
          this.cardList.forEach(card=> {
            if (card.cardId == data.cardId) {
              panel.dataShowType = card.renderMode;
            }
          });
          if(queryType!='SQL') {
            panel.singlePanelFilters = this.setPanelFilters(data.cardId);
          }
          let showChart = new ShowChart();
          let chartInfo = new ChartInfo(showChart, '');
          this.panelCharts[panelID] = chartInfo;
          this.panelCharts = Object.assign({}, this.panelCharts);
          break;
        case PanelType.filter:
          let groupName = e.dataset.groupName;
          let datas = this.setFilterPanel(groupName, panel.data);
          panel.data = datas;
          break;
      }
    }
    console.log('panelType:'+panel.panelType);
    this.addClass(e, 'ex-moved');
    if (e.parentNode) {
      e.parentNode.removeChild(e);
    }
  }

  public onOver(args) {
    let [e, el, container] = args;
    this.addClass(el, 'ex-over');
  }

  public onOut(args) {
    let [e, el, container] = args;
    this.removeClass(el, 'ex-over');
  }

  public onDragEnd(args) {
  }
  focusFn(e:Event){
    let target = e.target as any;
    target.select();
  }
  setDefault(e:any) {
    let target = e.target;
    let index = target.selectedIndex;
    let val = target.options[index].value;
    let un = target.dataset.uniqueName;
    this.curPage.pageFilters.forEach(filter=> {
      if (filter.uniqueName == un) {
        filter.defaultVal = val;
      }
    })
  }

  setFiltersFn({selectParams, item}) {
    if (item.cardIDs) {
      for (let cardId of item.cardIDs) {
        this.curPage.panels.forEach(panel=> {
          if (panel.panelType == PanelType.table) {
            let data = panel.data;
            if (data.cardId == cardId) {
              let card = new Card();
              card.cardId = data.cardId;
              card.cardName = data.cardName;
              card.dataSetId = data.dataSetId;
              card['params'] = selectParams;
              panel.data = card;
            }
          }
        })
      }
    }
  }

  //设置全局filter panel
  setFilterPanel(groupName:string, data:any) {
    this.curPage.pageFilters.forEach(f=> {

      if (f.groupName == groupName) {
        let param = new PanelFilter();
        param.defaultVal = f.defaultVal;
        param.uniqueName = f.uniqueName;
        param.paramName = f.name;
        param.cardIDs = f.cardIDs;
        param.groupName = f.groupName;
        let paramNameArr = param.uniqueName.split('].[');
        let dimension = paramNameArr[0].replace('[', '');
        let hierarchy = paramNameArr[1].replace('[', '');
        let levelName = paramNameArr[2].replace(']', '');
        let datasetName = '';
        this.datasetList.forEach(ds=> {
          if (ds.dataSetID == this.curPage.dataSetID) {
            datasetName = ds.dataSetName;
          }
        })
        param.cube = this.cube;
        this.dataHandleSer.getAllValueOfFilter({
          connection: param.cube.connection,
          catalog: param.cube.catalog,
          schema: param.cube.schema,
          name: param.cube.name,
          dimension: dimension,
          hierarchy: hierarchy,
          level: levelName,
          fromTemplateList:false
        }).subscribe(resp=> {
          let members =  (resp && resp.data) ||{};
          let distinctMember = [];
          for (let m of members) {
            let index = distinctMember.findIndex(d=> {
              if (d.name == m.name) return true;
            });
            if (index == -1) {
              if (m.uniqueName == param.defaultVal) {
                m['selected'] = true;
              }
              distinctMember.push(m);
            }
          }
          param.children = distinctMember;
        })
        if (data && data.length > 0) {
          let index = data.findIndex(p=> {
            if (p.paramName == param.paramName) {
              return true;
            }
          })
          if (index >= 0) {
            data[index] = param;
          } else {
            data.push(param);
          }
        } else {
          data = [param];
        }
      }
    })
    return data;
  }

  //设置单个panel的参数
  setPanelFilters(cardID:string):SinglePanelFilter[] {
    let panelFilterArr = [];
    this.cardList.forEach(card=> {
      if (card.cardId == cardID) {
        let thinQuery = JSON.parse(card.content.replace(/\n/g, ' ')) as query.QueryTemplate;
        this.cube = thinQuery.cube;
        this.curPage.cube=thinQuery.cube;
        let helper = new TemplateHelper();
        let filters = helper.setQueryTemplate(thinQuery).getAllParameter();
        for (let filter of filters) {
          // let param =filter.name;// filters[filterKey];
          let paramNameArr = filter.name.split('].[');
          let dimension = paramNameArr[0].replace('[', '');
          let hierarchy = paramNameArr[1].replace('[', '');
          let levelName = paramNameArr[2].replace(']', '');
          let panelFilter = new SinglePanelFilter();
          panelFilter.groupName = dimension + '.' + hierarchy;
          panelFilter.paramName =filter.showName;// levelName;
          panelFilter.uniqueName = filter.name;
          panelFilter.cube = thinQuery.cube;
          panelFilter.cardIDs = [cardID];
          panelFilter.show = false;
          panelFilterArr.push(panelFilter);
          // this.changePageFilter(param.name, cardID, thinQuery.cube);
        }
      }
    })
    return panelFilterArr;
  }
  loadDefaultPageFilterData(pageFilter:PageFilter){
    let paramNameArr = pageFilter.uniqueName.split('].[');
    let dimension = paramNameArr[0].replace('[', '');
    let hierarchy = paramNameArr[1].replace('[', '');
    let levelName = paramNameArr[2].replace(']', '');
    this.dataHandleSer.getAllValueOfFilter({
      connection: this.curPage.cube.connection,
      catalog: this.curPage.cube.catalog,
      schema: this.curPage.cube.schema,
      name: this.curPage.cube.name,
      dimension: dimension,
      hierarchy: hierarchy,
      level: levelName,
      fromTemplateList:false
    }).subscribe(resp=> {
      let members =  (resp && resp.data) ||{};
      let distinctMember = [];

      for (let m of members) {
        let index = distinctMember.findIndex(d=> {
          if (d.name == m.name) return true;
        });
        if (index == -1) {
          if (m.uniqueName == pageFilter.defaultVal) {
            m['selected'] = true;
          }
          distinctMember.push(m);
        }
      }
      pageFilter['data'] = distinctMember;
    })
  }
  showNext(e:any){
    let self=e.target;
    let nextObj=self.nextSibling.nextSibling.nextSibling as Element;
    // console.log('next:',nextObj);
    nextObj.setAttribute('style','display:block');
    //  this.renderer.setElementStyle(nextObj,'display','block');
  }
  public scrollFn(e:Event){
    console.log(e);
    //console.log(document.body.scrollTop,document.documentElement.scrollTop,e.type);
  }
  // public timer:any=0;
  savePanelTitle(e:any){
    this.cancelBubble(e);
    let target = <any>e.target;
    // let width = target.getBoundingClientRect().width;
    this.renderer.setElementStyle(target,'display','none');
      this.curPage.panels.forEach(panel=>{
        if(panel.panelID==e.target.dataset.panelId){
          panel.panelName=e.target.value;
          return;
        }
      })

    // },1000);

  }
  showPanelInputBox(e:MouseEvent) {
    this.cancelBubble(e);
    let target = <any>e.target;
    let width = target.getBoundingClientRect().width;
    let inputNode = target.getElementsByTagName('input')[0];

    // this.renderer.setElementStyle(inputNode, 'width', `${width}px`);
    this.renderer.setElementStyle(inputNode, 'display', 'block');
    inputNode.focus();
    inputNode.select();
  }


  public itemStringsLeft: any[] = [
    'Windstorm',
    'Bombasto',
    'Magneta',
    'Tornado'
  ];

  public itemStringsRight: any[] = [
    'Mr. O',
    'Tomato'
  ];

  test001(obj:any,e:any){
    console.log("click",obj,"---",e)
  }

  public sortTimer : any;
  sortTab(e:any){
    if(this.sortTimer){
      clearTimeout(this.sortTimer);
    }
    this.sortTimer=setTimeout(()=>{
      console.log("sortTab:",e);
      // this.dashboard.content=e;
    },1000);

  }
}
