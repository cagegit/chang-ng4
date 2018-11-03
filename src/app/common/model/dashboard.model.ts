import {type} from "os";
import {Card} from "./card/card.model";
import {ShowChart} from "../../module/card/card.showchart";
import {BasePermissionModel} from "./base-permission-model";
import {Cube} from "./card/schema.cube";
import {NgGridItemConfig} from "../../ng-grid";
import {LayoutUtil} from "../../module/dashboard/layout-util";
/**
 * Created by fengjj on 2016/12/28.
 */
interface RawPage {
  pageId:string;
  pageName:string;
  panels:Panel[];
}
export const enum DashType {
  "dataset",
  "conf"
}
export  const enum  PanelType {
  table,
  filter,
  text,
  img,
  config // 可配置报表类型
}
const H = 2;
const LAYOUT_INFOS = {
  "layoutOne":[
    {x:0,y:0,w:1,h:1},
    {x:0,y:1,w:1/2,h:1},
    {x:1/2,y:1,w:1/2,h:1},
    {x:0,y:2,w:1/2,h:1},
    {x:1/2,y:2,w:1/2,h:1}
  ],
  "layoutTwo":[
    {x:0,y:0,w:1/2,h:2},
    {x:1/2,y:0,w:1/2,h:1},
    {x:1/2,y:1,w:1/2,h:1},
    {x:0,y:2,w:1/2,h:1},
    {x:1/2,y:2,w:1/2,h:1}
  ],
  "layoutThree":[
    {x:0,y:0,w:1/2,h:1},
    {x:1/2,y:0,w:1/2,h:1},
    {x:0,y:1,w:1,h:1},
    {x:0,y:2,w:1,h:1}
  ],
  "layoutFour":[
    {x:0,y:0,w:2/3,h:1},
    {x:2/3,y:0,w:1/3,h:1},
    {x:0,y:1,w:1/3,h:1},
    {x:1/3,y:1,w:2/3,h:1},
    {x:0,y:2,w:2/3,h:1},
    {x:2/3,y:2,w:1/3,h:1}
  ]
}

export class ChartInfo{
  chartOpt:ShowChart;
  chartType:string;

  constructor(chartOpt?:ShowChart, chartType?:string) {
    this.chartOpt = chartOpt;
    this.chartType = chartType;
  }
}
export class Dashboard extends BasePermissionModel{
  dashboardID:string;
  dashboardName:string;
  content:any;
  datasetIds:string[];
  dataSetIDs:string[];
  dataSetNames : string[];
  updatedTime : number=1484657987000;
  updateTime:any;
  createdBy : string;
  createUserAvatarUrl:string;
  createUserDisplayName: string;
  // dashboardType : number;//  0:(默认)生成  1:通过应用模版生成 2:DEMO     DEMO, TEMPLATE, MANUAL;
  templateID : string;
  constructor(userList?:string, permissions?:string[],dashboardId = '', dashboardName = 'dashboard name', content = '[]',datasetIds = [],dataSetNames = [],updateTime? : any,createdBy?:string,createUserAvatarUrl?:string,createUserDisplayName?:string,templateID?:string) {
    super(userList, permissions);
    this.dashboardID = dashboardId;
    this.dashboardName = dashboardName;
    let cont =JSON.parse(content);
    this.content = cont as Page[];
    this.datasetIds = datasetIds;
    this.dataSetIDs = datasetIds;
    this.dataSetNames=dataSetNames;
    if(this.content.length > 0){
      this.content = this.content.map((page) => {
        return Page.build(page);
      })
    }
    this.updateTime=updateTime;
    this.createdBy=createdBy;
    this.createUserAvatarUrl = createUserAvatarUrl;
    this.templateID = templateID;
    this.createUserDisplayName=createUserDisplayName;
  }

  dataSetName(dataSetID : string) : string{
    let index=this.dataSetIDs.findIndex((temp:string)=>{
      return temp==dataSetID;
    });
    return this.dataSetNames[index];
  }

  changeName(name:string){
    this.dashboardName = name;
  }
  contentToString(){
    let dashboard = this.clone();
    dashboard.content = JSON.stringify(dashboard.content);
    return dashboard;
  }
  toJson(){
    this.content = JSON.parse(this.content);
    return this;
  }
  getPageByID(id){
    let p:Page;
    this.content.forEach((page:Page)=>{
      if(page.pageID === id){
        p = page;
      }
    })
    return p;
  }
  clone(){
    return Dashboard.build(this);
  }
  static build(obj:any){
    let content = '[]';
    if(typeof obj.content === 'string'){
      content = obj.content;
    }else{
      content = JSON.stringify(obj.content)
    }
    return new Dashboard(obj.userList,obj.permissions,obj.dashboardID,obj.dashboardName,content,obj.datasetIds,obj.dataSetNames,obj.updateTime,obj.createdBy,obj.createUserAvatarUrl,obj.createUserDisplayName,obj.templateID);
  }
}
export class Panel {
  panelID:string;
  panelName:string;
  singlePanelFilters:SinglePanelFilter[];
  panelType:PanelType = PanelType.table;
  panelX:number;
  panelY:number;
  panelW:number;
  panelH:number;
  content:any;
  config : any;
  /*
   图表切换table时使用
   */
  dataShowType:string;
  dataSetId:string;
  private _data:any;
  get data():any {
    return this._data;
  }
  set data(value:any) {
    if(value){
      this._data = value;
    }else {
      switch(this.panelType){
        case PanelType.table :
          this._data = new Card();
          break;
        case PanelType.img :
          this._data= '';
          break;
        case PanelType.filter:
          this._data=new Array<PanelFilter>();
          break;
        default:
          this._data = '';
      }
    }
    this.content = this._data;
  }

  constructor(panelId?:string,panelName?:string, panelType?:PanelType, panelX?:number, panelY?:number, panelW?:number, panelH?:number,content?:any,config?:any,singlePanelFilters?:SinglePanelFilter[],dataShowType?:string,dataSetId?:string) {
    this.panelID = panelId;
    if(panelName){
      this.panelName = panelName;
    }else{
      this.panelName ='请添加一个图表标题';
    }
    this.panelType = panelType;
    this.panelX = panelX;
    this.panelY = panelY;
    this.panelW = panelW;
    this.panelH = panelH;
    this.config = config;
    this.dataShowType=dataShowType;
    this.dataSetId=dataSetId;
    this.singlePanelFilters=singlePanelFilters;
    if(content){
      for(let filter of content){
        if(filter&&filter.paramName){
          filter.children=[];
        }
      }
      if(content.panelType==PanelType.table){
        content['params']=[{name:content.uniqueName,value:content.defaultVal}];
      }
      //this.content = content;
      this.data=content;
    }else{
      this.data = null;
    }
    //{card:string,imgUrl:string,text:string,filter:string}
  }
  static build(panelObj){
    return new Panel(panelObj.panelID,panelObj.panelName,panelObj.panelType,panelObj.panelX,panelObj.panelY,panelObj.panelW,panelObj.panelH,panelObj.content,panelObj.config,panelObj.singlePanelFilters,panelObj.dataShowType,panelObj.dataSetId);
  }

  static sort(panels : Panel[]){
    panels.sort((x:Panel, y:Panel) => {
      if(x.config.row==y.config.row){
        return x.config.col == y.config.col ? 0 : (x.config.col < y.config.col ? -1 : 1);
      } else {
        return x.config.row < y.config.row ? -1 : 1;
      }
    });
  }

  changeType(type:PanelType){
    this.panelType = type;
  }
  changeName(name:string){
    this.panelName = name;
  }
  clear(){
    this.data = null;
    this.panelName='';
  }
}
//pageFilters:[
//  {
//    name:'cardid',
//    params:[
//      {
//        name:'[git log].[shijian].[nian]',
//        defalutVal:''
//
//      }
//    ]
//  }
//]
//export class FilterParam{
//  name:string;
//  defalutVal:string;
//  constructor(name?:string, defalutVal?:string) {
//    this.name = name;
//    this.defalutVal = defalutVal;
//  }
//  static build(filterParam:any){
//    return new FilterParam(filterParam.name,filterParam.defalutVal);
//  }
//}
export class PageFilter {
  name:string;
  defaultVal:string;
  cardIDs:string[] = [];
  groupName:string;
  uniqueName:string;
  // constructor(name?:string, defalutVal?:string, cardIDs?:string[]) {
  //   this.name = name;
  //   this.defalutVal = defalutVal;
  //   this.cardIDs = cardIDs || [];
  // }
  constructor(name?:string, defaultVal?:string, cardIDs?:string[],groupName?:string,uniqueName?:string) {
    this.name = name;
    this.defaultVal = defaultVal;
    this.cardIDs = cardIDs || [];
    this.groupName=groupName;
    this.uniqueName=uniqueName;
  }

  static build(pageFilter){
    return new PageFilter(pageFilter.name,pageFilter.defaultVal,pageFilter.cardIDs,pageFilter.groupName,pageFilter.uniqueName)
  }

}
export class Page {
  pageID:string;
  pageName:string;
  panels:Panel[];
  cube:Cube;
  // filters:Filter[];
  dataSetID:string;
  pageFilters:PageFilter[] = [];
  href:string;
  safeUrl:any;
  menuId: string;
  constructor(pageId?:string, pageName = '新建页面', panels = [],dataSetId?:string,pageFilters?:PageFilter[],cube?:Cube,href?:string,menuId?:string) {
    this.pageID = pageId;
    this.pageName = pageName;
    this.dataSetID = dataSetId;
    this.cube=cube;
    if(panels) {
      this.panels = panels.map((panel) => {
        return Panel.build(panel)
      })
    }else {
      this.panels = [];
    }
    if(pageFilters){
      this.pageFilters = pageFilters.map((pageFilter:PageFilter) => {
        return PageFilter.build(pageFilter);
      })
    }else {
      this.pageFilters = [];
    }
    this.href=href;
    this.menuId = menuId
  }
  static build(pageObj) {
    return new Page(pageObj.pageID,pageObj.pageName,pageObj.panels,pageObj.dataSetID,pageObj.pageFilters,pageObj.cube,pageObj.href,pageObj.menuId);
  }





  /**------------------------------------------------------------------------------------------------------------------布局开始**/
  initPannels(gridItemConfigArr : NgGridItemConfig[]){
    let panels = [];
    for(let gridItemConfig of gridItemConfigArr){
      let panel = new Panel();
      panel.panelID = this.createUUID();
      panel.panelType = 0;
      panel.config=gridItemConfig;
      panels.push(panel);
    }
    this.panels = panels;
    this.href="";
  }

  addPanel(){
    let panels = this.panels.slice(0);
    let panel = new Panel();
    panel.panelID = createUUID();
    panel.panelType = 0;
    panel.config=LayoutUtil.addItem(this.panels.length);
    panels.push(panel);
    this.panels = panels;
  }

  /**------------------------------------------------------------------------------------------------------------------布局结束**/

  addPanels(lanes:number,row:number,col:number,direction:string) {
    let n = lanes / col;
    let panels = [];
    for(let i = 0;i < row;i++){
      for(let j = 0;j < col;j++){
        let panel:Panel = new Panel();
        panel.panelW = n;
        panel.panelH = H;
        panel.panelX = n * j;
        panel.panelY = i*H;
        panel.panelType = 0;
        panel.panelID = createUUID();
        panels.push(panel);
      }
    }
    this.panels = panels;
  }
/*  addPanel(lanes:number){
    let panels = this.panels.slice(0);
    let panel = new Panel();
    let maxH = this.computeMaxPanelH();
    panel.panelW = lanes;
    panel.panelH = H;
    panel.panelX =0;
    panel.panelY =maxH;
    panel.panelType = 0;
    panel.panelID = createUUID();
    panels.push(panel);
    this.panels = panels;
  }*/
  addPageFilter(pageFilter:PageFilter){
    this.pageFilters.push(pageFilter);
  }
  /***
   * 计算panels中的最大y值
   * @returns {number}
   */
  private computeMaxPanelH(){
    if(this.panels.length == 0){
      return 0;
    }
    let yList = this.panels.map((panel:Panel)=>{ return panel.panelY+panel.panelH});
    return Math.max.apply(null,yList);
  }
  private computeMaxPanel

  /***
   * 修改页面名字
   * @param name
   */
  changePageName(name:string){
    this.pageName = name;
  }

  /***
   * 修改page 对应的dataSetID
   * @param id
   */
  changeDataSetID(id:string){
    this.dataSetID = id;
  }

  changeMenuID(id:string){
    this.menuId = id;
  }
  clone(page:Page) {
    return Page.build(page);
  }

  /**
   * 添加特殊布局的panel列表
   * @param lanes
   * @param layout
   */
  addSpecialPanels(lanes:number,layout:string){
    let panels = [];
    for(let p of LAYOUT_INFOS[layout]){
      let panel = new Panel();
      panel.panelID = this.createUUID();
      panel.panelType = 0;
      panel.panelX = lanes*p.x;
      panel.panelY = H*p.y;
      panel.panelH = H*p.h;
      panel.panelW = lanes*p.w;
      panels.push(panel);
    }
    this.panels = panels;
  }

  /**
   * 删除所有的panel
   */
  removeAllPanels(){
    this.panels = [];
  }

  /**
   * 删除指定id的panel
   * @param panelId
   */
  removePanel(panelId:string) {
    this.panels = this.panels.filter((p:Panel)=> {
      return p.panelID !== panelId;
    })
  }

  /**
   * 根据id 获取panel
   * @param id
   * @returns {Panel}
   */
  getPanelById(id:string){
    for(let panel of this.panels){
      if(panel.panelID === id){
        return panel;
      }
    }
  }

  /**
   * 添加pageFilter
   * @param name
   * @param cardID
   */
  changePageFilter(name:string,cardID:string){
    let pageF;
    for(let pageFilter of this.pageFilters){
      if(pageFilter.name === name){
        pageF = pageFilter;
      }else{
        let index = pageFilter.cardIDs.indexOf(cardID);
        if(index>-1){
          pageFilter.cardIDs.splice(index,1);
        }
      }
    }
    if(pageF){
      if(pageF.cardIDs.indexOf(cardID)  === -1){
        pageF.cardIDs.push(cardID);
      }
    }else{
      let pFilter = new PageFilter();
      let paramNameArr=name.split('].[');
let dimension=paramNameArr[0].replace('[','');
      let hierarchy=paramNameArr[1].replace('[','');
      let levelName=paramNameArr[2].replace(']','');
      pFilter.name = levelName
      pFilter.groupName=dimension+'.'+hierarchy;
      pFilter.uniqueName=name;
      pFilter.cardIDs.push(cardID);
      this.pageFilters.push(pFilter);
    }
  }

  /**
   * 删除pageFilter 中对应的所有cardID
   * @param cardID
   */
  removeCardIDFromPageFilter(cardID:string){
    console.log('remove',cardID)
    for(let pageFilter of this.pageFilters){
      let index = pageFilter.cardIDs.indexOf(cardID);
      if(index>-1){
        pageFilter.cardIDs.splice(index,1);
      }
    }
    console.log('remove page',this);
  }

  /***
   * 当pageFilter.cardIDs 的length 为0时认为是无用的
   */
  removeUseLessPageFilter(){
    this.pageFilters = this.pageFilters.filter((pageFilter:PageFilter)=>{
      return pageFilter.cardIDs.length;
    })
    return this;
  }
  /***
   * 创建uuid
   * @returns {string}
   */
  private createUUID():string {
    let uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
    return uuid;
  }
}
export function createUUID(){
  let uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function (c) {
      let r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();
  return uuid;
}
export class Filter {
  static build(){
    return new Filter();
  }
}
export class PanelFilter{
  paramName:string;
  uniqueName:string;
  type:string;
  cube:Cube;
  defaultVal:string;
  children:any;
  cardIDs:string[];
  groupName:string;
}
export class SinglePanelFilter{
  paramName:string;
  uniqueName:string;
  type:string;
  cube:Cube;
  children:any;
  cardIDs:string[];
  groupName:string;
  show:boolean;
  showChildren?:any
}
export class SelectParam {
  name:string;
  value:string[];
}
export class SelectText {
  name:string;
  value:string;
}
