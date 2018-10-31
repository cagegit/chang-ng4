/**
 * Created by fengjj on 2017/1/7.
 */
import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { PanelType,PanelFilter, SelectParam, SinglePanelFilter } from '../../common/model/dashboard.model';
import {ChartInfo} from "../../common/model/dashboard.model";
import {Card} from "../../common/model/card/card.model";
import {CardResult} from "../../common/model/card/card.resut";
import {DashboardService} from "../../common/service/dashboard.service";
import {TemplateHelper} from "../card/templateHelper";
import {FileUploader} from "ng2-file-upload/ng2-file-upload";
import {CFG} from "../../common/CFG";
import {ParsedResponseHeaders} from "ng2-file-upload/ng2-file-upload";
import {ChartUtil} from "../../chart/chart.util";
import {Loading} from "../../common/loading.mask.util";
import {CardService} from "../../common/service/card.service";
import {Dimension} from "../../common/model/card/schema.dimension";
import {MetaData} from "../../common/model/card/schema.metadata";
import {DrilldownComponent} from "../card/drilldown.component";
import {SectionDimensionComponent} from "../card/section-dimension.component";
import {Measure} from "../../common/model/card/schema.measure";
import {ChartHighChartComponent} from "../../chart/chart.highchart.component";
import {QueryInfo, QueryResult, QueryResultInfo} from "../../common/model/card/query.model";
import { DataHandleService } from '../../changan/data.handle.service';
@Component({
  selector: 'panel-init',
  templateUrl: './panel-init.component.html',
  styleUrls: ['./panel-init.component.css'],
  providers:[ChartUtil]
})
export class PanelInitComponent implements OnChanges {
  private _chartContainer:ElementRef;
  @ViewChild('panelBox') panelBox:ElementRef;
  @ViewChild('addImgUrl') addImgUrl:ElementRef;
  @ViewChild('textEidter') textEidter:ElementRef;
  @ViewChild('drilldown') drilldownCom:DrilldownComponent;
  @ViewChild('sectionDimension') sectionDimension:SectionDimensionComponent;
  @ViewChild('highchart') highchart:ChartHighChartComponent;

  @ViewChild('chartContainer')
  set chartContainer(value:ElementRef) {
    this._chartContainer = value;
    //this.loadCardProperties();
    this.computeViewSize();
  }

  get chartContainer() {
    return this._chartContainer;
  }

  @Input() data:any;
  @Input() singlePanelFilters:SinglePanelFilter[];
  @Input() panelType:PanelType;
  @Input() panelID:string;
  @Input() panelCharts:{[key:string]:ChartInfo};
  @Input() changePanelShowType:string;
  @Input() preview = false;
  @Input() fromTemplateList:boolean;
  @Output() createPageFilterEvent = new EventEmitter();
  @Output() addDataEvent = new EventEmitter();
  @Output() setFilterEvent = new EventEmitter<any>();
  @Output() showSectionOrDrill = new EventEmitter<any>();

  defaultParams:SelectParam[] = new Array<SelectParam>();
  selectParams:SelectParam[] = new Array<SelectParam>();
  textFlag = false;
  imgH:number;
  imgW:number;
  cardResult:any;
  el:HTMLElement;
  pHeight:number;
  pWidth:number;
  pType = {
    table: 0,
    filter: 1,
    text: 2,
    img: 3
  };
  private showType;
  private chartType;
  dimensions:Dimension[];
  @Input() measures:Measure[];
  @Input() measureGroup:Set<string>;
  // @Input() drill:boolean;
  // @Input() section:boolean;
  helper:TemplateHelper = new TemplateHelper();
  drill = false;
  section = false;

  public uploader:FileUploader;
  // private barChart = new ShowChart();
  private barChart = this.chartUtil;
  private options:Object = this.barChart.options;
  // private chart:any;

  //pagination start
  curPage:number = 0;
  pageSize:number = 100;
  totalPage:number = 1;
  pageParams:number[];
  //pagination end
  queryType:string;

  constructor(@Inject(ElementRef) elementRef:ElementRef, private dashboardService:DashboardService, private cardService:CardService,private dataHandleSer:DataHandleService,private chartUtil:ChartUtil) {
    // this.el = elementRef.nativeElement;
    this.uploader = new FileUploader({
      // url: CFG.API.USER + '/avatar',
      // url : 'http://datasee.csdn.net/csdn-das-usermgt/0.0.5/users/avatar', datasee/pic/
      url: CFG.API.IMAGE + '?namespace=dashboard',
      autoUpload: true,
      allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      maxFileSize: 5 * 1024 * 1024 // 5 MB
    });
    // console.log(this.uploader);
    this.uploader.onErrorItem = function (item:any, response:string, status:number, headers:ParsedResponseHeaders) {
      console.error("用户头像上传失败", item, response, status, headers);
      // this.appNotification.success("图片上传失败!");
    }
  }

  ngOnInit() {
    console.log("PanelInitComponent.ngOnInit----------------------");
    this.computeImgSize();
  }

  ngOnChanges(changes:SimpleChanges) {
    let dataChange=changes['data'];
    if (dataChange&&dataChange.currentValue) {
      let data = dataChange.currentValue as Card;
      if(data.queryType) {
        this.queryType = data.queryType;
      }else{
        this.queryType='OLAP';
      }
      this.data = data;
      this.getCellSet(data);
    }
    if (changes['panelType'] && changes['panelType'].currentValue) {
      let panelType = changes['panelType'].currentValue;
      if (panelType == this.pType.filter) {
        for (let filter of this.data) {
          this.loadOptions(filter);
        }
      } else if (panelType == this.pType.text) {
        this.data.replace(/\n/g, '<br>');
      }
    }
    if (changes['changePanelShowType'] && !changes['changePanelShowType'].isFirstChange() && changes['changePanelShowType'].currentValue) {
      this.changePanelShowType = changes['changePanelShowType'].currentValue;
      this.loadCardProperties();
    }
  }

  ngAfterViewInit() {
    /*    setTimeout(()=>{
     this.pHeight =  this.panelBox.nativeElement.getBoundingClientRect().height;
     this.pWidth = this.panelBox.nativeElement.getBoundingClientRect().width;
     this.computeImgSize();
     },0)*/
  }

  getCellSet(data:Card) {
    if (data.cardId && data.dataSetId) {
      this.cardResult = null;
      Loading.addCircleLoadingToContainer(this.panelBox);
      let $this = this;
      if(!this.data.queryType||this.data.queryType!='SQL') {
        this.dataHandleSer.getCellSet(data.cardId, data.dataSetId, data['params'], this.pageParams, this.fromTemplateList).subscribe((res) => {
          if(res && res.data) {
            const d = res.data;
            $this.cardResult = d;
            if (d && d.cellset) {
              this.queryType = 'OLAP';
              let filters = $this.helper.setQueryTemplate(d.query).getAllParameter();
              let cube = $this.helper.model().cube;
              //dashboard编辑页调用，左侧全局筛选条件列表，暂时去掉
              // if (!this.preview) {
              //   $this.createPageFilterEvent.emit({filters: filters, cardID: data.cardId, cube: cube});
              // }
              //存在singlePanelFilters时，获取metadata
              if (this.singlePanelFilters && this.singlePanelFilters.length > 0) {
                //设置过滤条件中的默认选中项
                this.defaultParams = $this.helper.getDefaultParameter();
                //设置过滤条件中的可更改选中项
                this.defaultParams.forEach(cp => {
                  let cloneParam = new SelectParam();
                  cloneParam.name = cp.name;
                  let valArr = [];
                  cp.value.forEach(cv => {
                    valArr.push(cv);
                  });
                  cloneParam.value = valArr;
                  this.selectParams.push(cloneParam);
                });
                $this.dataHandleSer.getMetaData(cube, this.fromTemplateList).subscribe(rep => {
                  if(rep && rep.data) {
                    let meta = rep.data as MetaData;
                    $this.dimensions = meta.dimensions;
                    $this.measures = meta.measures;
                    $this.measureGroup = new Set<string>();
                    meta.measures.forEach(m => {
                      if (m.calculated) {
                        $this.measureGroup.add('计算指标');
                      } else {
                        $this.measureGroup.add(m.measureGroup);
                      }
                    })
                  }
                })
              }
            }
            $this.loadCardProperties();
            Loading.removeCircleLoadingToContainer($this.panelBox);
          }
        }, (err: Error) => {
          console.log('this exec error');
          this.createPageFilterEvent.emit({filters: null, cardID: data.cardId, cube: null});
          Loading.removeCircleLoadingToContainer($this.panelBox);
        })
      }else{
        // this.queryRun();
      }
    } else {
      this.cardResult = null;
    }
  }

  searchRun({searchParams}) {
    if (searchParams) {
      searchParams.forEach(sp=> {
        if (sp.name) {
          let uniqueNameArr = sp.name.split('.');
          if (uniqueNameArr.length == 3) {
            let hierarchyName = uniqueNameArr[0] + '.' + uniqueNameArr[1];
            let levelName = uniqueNameArr[2].replace(/\[|\]/g, '');
            let hierarchy = this.helper.getHierarchy(hierarchyName);
            for (let lvName in hierarchy.levels) {
              if (lvName == levelName) {
                let selectedMembers = [];
                sp.value.forEach(sv=> {
                  selectedMembers.push({
                    name: sv.split('.')[2].replace(/\[|\]/g, ''),
                    uniqueName: sv
                  });
                })
                hierarchy.levels[lvName]['selection'] = {
                  parameter:sp.name,
                  type: "INCLUSION",
                  members: selectedMembers
                }
              }
            }
          }
        }
      })

      this.run();
    }
  }

  run(helper?:TemplateHelper,fromPage?:boolean) {
    this.cardResult = null;
    Loading.addCircleLoadingToContainer(this.panelBox);
    if (helper) {
      this.helper = helper;
    }
    if(!fromPage){
      this.curPage=0;
    }
    let $this = this;
    this.dataHandleSer.executeForPage(this.helper.model(), this.curPage, this.pageSize,this.fromTemplateList).subscribe(rep=> {
      this.cardResult = rep.data as CardResult;
      this.selectParams = $this.helper.setQueryTemplate(this.cardResult.query).getDefaultParameter();
      this.loadCardProperties();
      Loading.removeCircleLoadingToContainer($this.panelBox);
    }, error=> {
      Loading.removeCircleLoadingToContainer($this.panelBox);
    });
  }
  queryRun(fromPage?:boolean){
    if(!fromPage){
      this.curPage=0;
    }
    let queryInfo=JSON.parse(this.data.content) as QueryInfo;
    let $this = this;
    this.cardService.executeSQLForPage(queryInfo.sqlStr,this.data.dataSetId,this.curPage,this.pageSize).subscribe(rep=>{
      let result = rep.QueryResult as QueryResult;
      if($this.data.renderMode!='originTable'){
        let queryAll=new QueryResultInfo();
        queryAll.queryResult=result;
        queryAll.properties=queryInfo.properties;
        queryAll.measureIndexs=queryInfo.measureIndexs;
        queryAll.dimensionIndexs=queryInfo.dimensionIndexs;
        $this.cardResult=queryAll;
      }else{
        $this.cardResult=result;
      }
      $this.loadCardProperties();
      Loading.removeCircleLoadingToContainer($this.panelBox);
    }, error=> {
      Loading.removeCircleLoadingToContainer($this.panelBox);
    })
  }
  generatePageFilter(filters:any, cardID:string) {
    //let filterParams:FilterParam[] = [];
    //let pageFilter = new PageFilter();
    //filters.map((filter:any)=>{
    //  filterParams.push(new FilterParam(filter.name));
    //})
    //pageFilter.name = cardID;
    //pageFilter.filterParams = filterParams;
    //console.log(pageFilter);
    //return pageFilter;
  }

  loadCardProperties() {
    // let chartType=this.changePanelShowType[this.panelID];
    this.totalPage = Math.ceil((this.cardResult.height - this.cardResult.topOffset) / this.pageSize);
    let renderMode ='table';
    if (this.changePanelShowType && this.changePanelShowType == 'chart_table') {
      renderMode = 'table';
    }else if(this.cardResult.hasOwnProperty('results')){
      renderMode='table';
      this.totalPage = Math.ceil(this.cardResult.totalCount / this.pageSize);
    }else if(this.cardResult.hasOwnProperty('properties')){
      renderMode=this.cardResult.properties['saiku.ui.render.mode'];
      this.totalPage = Math.ceil(this.cardResult.queryResult.totalCount / this.pageSize);
    }else{
     renderMode= this.cardResult.query.properties['saiku.ui.render.mode'];
    }

    if (renderMode == 'table'||renderMode == 'originTable') {
      this.showType = 'table';
    } else if (renderMode == 'txt') {
      this.showType = 'txt';
    }else {
      this.showType = 'chart';
      this.chartType = renderMode;
      this.showChartOption();
      this.computeViewSize();
    }
  }


  showChartOption() {
    if(this.cardResult.hasOwnProperty('properties')){
      this.barChart = Object.assign(this.barChart, this.cardResult.properties['saiku.ui.chart.options']);
    }else if(this.cardResult.hasOwnProperty('cellset')){
      this.barChart = Object.assign(this.barChart, this.cardResult.query.properties['saiku.ui.chart.options']);
    }

    // this.barChart = Object.assign(this.barChart, {chart: this.chart}, this.cardResult.query.properties['saiku.ui.chart.options']);
  }

  showFileFolder(e:MouseEvent) {
    this.cancelBubble(e);
    let target = <HTMLElement>e.target,
      pNode = <HTMLElement> target.parentNode,
      inputNode = <HTMLElement>pNode.getElementsByTagName('input')[0];
    inputNode.click();
  }

  uploadImg(e:any) {
    var self = this;
    this.uploader.onSuccessItem = function (item:any, response:string, status:number, headers:ParsedResponseHeaders) {
      let img = CFG.API.IMAGE + '/' + JSON.parse(response).HashMap.fieldId + '?namespace=dashboard&rnd=' + Date.parse(String(new Date()));
      self.addDataEvent.emit(img);
      self.computeImgSize();
      //console.log(userHeadImg);
      //console.log("上传成功:",userHeadImg,'开始编辑用户头像...');
      ////上传成功后,下次登录,刷新页面服务端重新返回用户头像信息

    }
  }

  showAddImgUrlInput(e:MouseEvent) {
    let target = <HTMLElement>e.target,
      pNode = <HTMLElement>target.parentNode;
    pNode.style.display = "none";
    // console.log(this.addImgUrl);
    this.addImgUrl.nativeElement.style.display = 'block';
    this.addImgUrl.nativeElement.focus();
  }

  addImgUrlHandle(e:any) {
    let val = this.addImgUrl.nativeElement.value;
    if (val.length) {
      this.computeImgSize();
      this.addImgUrl.nativeElement.style.display = "none";
      this.addImgUrl.nativeElement.value = '';
      this.addDataEvent.emit(val);
    }
  }

  showTextarea(e:MouseEvent) {
    this.cancelBubble(e);
    //let target = <HTMLElement> e.target;
    //let pNode = <HTMLElement> target.parentNode;
    //console.log(pNode);
    //this.textEidter.nativeElement.style.display = 'table';
    //this.textEidter.nativeElement.focus();
    //pNode.style.display = 'none';
    this.textFlag = true;
  }

  inputText(e:any) {
    let target = <HTMLTextAreaElement>e.target;
    this.textFlag = false;
    this.addDataEvent.emit(target.value);
  }

  computeImgSize() {
    this.imgH = this.panelBox.nativeElement.getBoundingClientRect().height - 25;
    this.imgW = this.panelBox.nativeElement.getBoundingClientRect().width - 20;
    // console.log("computeImgSize", this.imgW, this.imgH);
  }

  cancelBubble(e:any) {
    e.stopPropagation();
    //e.preventDefault();
  }

  loadOptions(item:PanelFilter) {
    let paramNameArr = item.uniqueName.split('].[');
    let dimension = paramNameArr[0].replace('[', '');
    let hierarchy = paramNameArr[1].replace('[', '');
    let levelName = paramNameArr[2].replace(']', '');
    this.dataHandleSer.getAllValueOfFilter({
      connection: item.cube.connection,
      catalog: item.cube.catalog,
      schema: item.cube.schema,
      name: item.cube.name,
      dimension: dimension,
      hierarchy: hierarchy,
      level: levelName,
      fromTemplateList:this.fromTemplateList
    }).subscribe(resp=> {
      let members = (resp && resp.data) || {};
      let distinctMember = [];
      for (let m of members) {
        let index = distinctMember.findIndex(d=> {
          if (d.name == m.name) return true;
        });
        if (index == -1) {
          if (m.uniqueName == item.defaultVal) {
            m['selected'] = true;
          }
          distinctMember.push(m);
        }
      }
      item.children = distinctMember;
    })
  }

  /*
   全局搜索条件
   */
  searchFilter(e:any, item:PanelFilter) {
    let target = e.target;
    let index = target.selectedIndex;
    let val = target.options[index].value;
    let selected = new SelectParam();
    selected.name = item.uniqueName;
    selected.value = val;
    let ind = this.selectParams.findIndex(s=> {
      if (s.name == item.uniqueName) return true;
    });
    if (ind == -1)
      this.selectParams.push(selected);
    else {
      this.selectParams[ind] = selected;
    }
    this.setFilterEvent.emit({selectParams: this.selectParams, item: item});
  }

  showSectionDimension(options:any) {
    if (this.drill) {
      options = Object.assign(options, {dimensions: this.dimensions, helper: this.helper});
    } else if (this.section) {
      options = Object.assign(options, {
        dimensions: this.dimensions,
        measures: this.measures,
        measureGroup: this.measureGroup,
        helper: this.helper
      });
    }
    this.showSectionOrDrill.emit({
      drill: this.drill,
      section: this.section,
      drillOptions: options,
      drillPanelID: this.panelID
    });

  }

  public onResizeStop(width:number, height:number) {
    let contentW = width - 20, contentH = height - 55;
    this.imgW = contentW;
    this.imgH = contentH;
    if (this.showType == 'chart') {
      // this.barChart.changeView(contentW, contentH, this.chart);
      this.highchart.changViewFn(contentW, contentH);
    }
  }

  printSize() {
    // console.info("printSize:", this.imgW, this.imgH);
  }

  //#region 分页 start
  prevPage() {
    if (this.curPage > 0) {
      this.curPage--;
      this.setParamForPage();
      // this.getCellSet(this.data);
      if(this.queryType!='SQL') {
        this.run(null, true);
      }else{
        // this.queryRun(true);
      }
    }
  }

  nextPage() {
    if (this.curPage >= 0 && this.curPage < this.totalPage - 1) {
      this.curPage++;
      this.setParamForPage();
      if(this.queryType!='SQL') {
        this.run(null, true);
      }else{
        // this.queryRun(true);
      }
      // this.getCellSet(this.data);
    }
  }

  setParamForPage() {
    // this.pageParams = [];
    // let pageSizeParam = new SelectParam();
    // pageSizeParam.name = "pageSize";//curPage
    // pageSizeParam.value = this.pageSize.toString();
    // this.pageParams.push(pageSizeParam);

    // let curPageParam = new SelectParam();
    // curPageParam.name = "curPage";
    // curPageParam.value = this.curPage.toString();
    this.pageParams = [this.pageSize, this.curPage];
  }

  changPageFn(isNext:boolean) {
    if (isNext) {
      this.nextPage();
    } else {
      this.prevPage();
    }
  }

  //#region 分页 end
  private computeViewSize() {
    if (this.chartContainer) {
      let eleInfo = this.chartContainer.nativeElement.getBoundingClientRect();
      // console.log("loadCardProperties.---------------",eleInfo.width*0.8,eleInfo.height,this.imgW,this.imgH);
      // this.barChart.changeView(this.imgW,this.imgH);
      // this.barChart.changeView(eleInfo.width, eleInfo.height - 10, this.chart);
      // this.barChart.handleData(this.cardResult, this.chartType, this.chart);
      this.highchart.changViewFn(eleInfo.width - 30, eleInfo.height - 10);

    }
  }
}

