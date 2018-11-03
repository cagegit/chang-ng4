/**
 * Created by fengjj on 2017/1/6.
 */
import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, SimpleChanges,
  OnChanges
} from '@angular/core';
import {LayoutUtil} from "./layout-util";
import {AppNotification} from "../../app.notification";
@Component({
  selector:'page-layout',
  templateUrl:'./page-layout.component.html',
  styleUrls:['./page-layout.component.css']
})
export class PageLayoutComponent implements OnInit,OnChanges{
  @Input() top:string;
  @Output() createLayoutEvent = new EventEmitter();
  @Output() pageTypeChange = new EventEmitter();
  @ViewChild('row') row:ElementRef;
  @ViewChild('col') col:ElementRef;
  layoutType:string;
  defaultFlag = false;
  pageType : string=PageLayoutComponent.PAGE_TYPE.TEMPLATE;
  layoutOpt =<any>{
    layoutType:''
  }

  static PAGE_TYPE={
    TEMPLATE : "template",
    CUSTOM : "custom",
    IFRAME : "iframe"
  }


  templates : any=LayoutUtil.DEFAULT_ITEM_CONFIG_LIST;
  currentTemplateIndex : number=0;
  itemCount : number=3;
  @Input() url : string;
  constructor(private appNotification:AppNotification){}
  ngOnInit() {
    console.log("init初始化")
    // this.changePageType("template");
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("change");
    let positionChange=changes['url'];

    if(positionChange&&positionChange.currentValue){
      this.changePageType("iframe");
    }else{
      this.changePageType("template");
    }
  }



  changeItemCount(itemCount : number){
    console.log("changeItemCount:",this.itemCount);
    this.itemCount=itemCount;
  }
  changeCurrentTemplate(index : number){
    this.currentTemplateIndex=index;
  }

  createLayout(){
    let url="";
    let arr=[];
    if(this.pageType==PageLayoutComponent.PAGE_TYPE.TEMPLATE){
      arr=LayoutUtil.getTemplate(this.currentTemplateIndex);
    }else if(this.pageType==PageLayoutComponent.PAGE_TYPE.CUSTOM){
      arr=LayoutUtil.getCustom(this.itemCount);
    }else if(this.pageType==PageLayoutComponent.PAGE_TYPE.IFRAME){
        url=this.url;
        this.appNotification.success("设置成功,点击保存后生效!");
    }
    console.log("创建动态布局:",url,arr);
    this.createLayoutEvent.emit({url:url,arr:arr});
  }










  changeLayoutFn(e:MouseEvent,layoutType:string){
    console.log(this.defaultFlag)
    if(this.defaultFlag){
      this.layoutOpt.layoutType = 'normal';
      this.layoutOpt.row = this.row.nativeElement.value;
      this.layoutOpt.col = this.col.nativeElement.value;
    }else{
      switch (layoutType){
        case 'normal1':
          this.layoutType = layoutType;
          this.layoutOpt.layoutType = 'normal';
          this.layoutOpt.row = 3;
          this.layoutOpt.col = 2;
          break;
        case 'normal2':
          this.layoutType = layoutType;
          this.layoutOpt.layoutType = 'normal';
          this.layoutOpt.row = 3;
          this.layoutOpt.col = 1;
          break;
        case 'layoutOne':

        case 'layoutTwo':
        case 'layoutThree':
        default:
          this.layoutType = layoutType;
          this.layoutOpt.layoutType = layoutType;
      }
    }

  }
  createLayoutFn(e:MouseEvent){
    console.log("保存成功");
    this.createLayoutEvent.emit(this.layoutOpt);

  }
  changeFlag(n:number){
    this.defaultFlag = n?true:false;
    console.log(this.defaultFlag);
  }

  changePageType(pageType : string){
    console.log("changePageType:",pageType);
    this.pageType=pageType;
    this.pageTypeChange.emit(pageType);
  }

}
