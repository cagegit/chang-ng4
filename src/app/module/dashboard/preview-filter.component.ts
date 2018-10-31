/**
 * Created by fengjj on 2017/1/17.
 */
/**
 * Created by fengjj on 2017/1/17.
 */
//panel-filter.component
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  Renderer
} from '@angular/core';
import {SinglePanelFilter, Panel, SelectText, SelectParam} from "../../common/model/dashboard.model";
import {Card} from "../../common/model/card/card.model";
@Component({
  selector: 'preview-filter',
  templateUrl: './preview-filter.component.html',
  styleUrls: ['./preview-filter.component.css']
})
export class PreviewFilterComponent implements OnInit {

  @Input() left:string;
  @Input() top:string;
  @Input() filters:SinglePanelFilter[];
  @Input() panel:Panel;
  @Output() setFilterEvent = new EventEmitter<any>();
  @Output() searchRunEvent = new EventEmitter<any>();
  /*
  设置选中项
   */
  selectParams = new Array<SelectParam>();
  /*
  设置恢复默认选中项
   */
  defaultParams = new Array<SelectParam>();
  /*
  设置选中显示文本
   */
  selectTexts = Array<SelectText>();
  /*
  true:调用exportjson接口，false:调用execute接口
   */
  isDefault:boolean=false;
  constructor(private renderer:Renderer) {

  }

  ngOnInit():void {
    this.filters.forEach(f=> {
      let textObj = new SelectText();
      textObj.name = f.uniqueName;
      textObj.value = '选择';
      this.selectTexts.push(textObj);
    })

    if (this.panel) {
      let card = this.panel.data as Card;
      if (card) {
        if (card['defaultParams']) {
          this.defaultParams = card['defaultParams'];
        }
        if(card['params']){
          card['params'].forEach(cp=> {
            let cloneParam=new SelectParam();
            cloneParam.name=cp.name;
            let valArr=[];
            cp.value.forEach(cv=>{
              valArr.push(cv);
            })
            cloneParam.value=valArr;
            this.selectParams.push(cloneParam);
            this.selectTexts.forEach(st=> {
              if (st.name == cp.name) {
                let vals = '';
                cp.value.forEach(val=> {
                  let valStrArr=val.split('].[');
                 let hierarchName=valStrArr[0]+'].['+valStrArr[1]+']';
                  vals +=val.replace(hierarchName+'.','').replace(/\]\.\[/g,'-').replace(/\]|\[/g,'')+',';// val.split('].[')[2].replace(']', '') + ',';
                })
                if (vals.length >= 1) {
                  st.value = vals.substr(0, vals.length - 1);
                }
              }
            })
          })
        }
      }
    }
  }
//修改选择框显示文本
  changeShowSpan({members,setDefault}) {
    if(setDefault){
      this.isDefault=true;
    }else{
      this.isDefault=false;
    }
    // this.selectParams=members;
    members.forEach(cp=> {
      this.selectTexts.forEach(st=> {
        if (st.name == cp.name) {
          let vals = '';
          cp.value.forEach(val=> {
            let valStrArr=val.split('].[');
            let hierarchName=valStrArr[0]+'].['+valStrArr[1]+']';
            vals +=val.replace(hierarchName+'.','').replace(/\]\.\[/g,'-').replace(/\]|\[/g,'')+',';// val.split('].[')[2].replace(']', '') + ',';
          })
          if (vals.length >= 1) {
            st.value = vals.substr(0, vals.length - 1);
          } else {
            st.value = '选择';
          }
        }
      })
    })
  }
close(){

}
  changeSwitch(e:MouseEvent, switchFlag:boolean) {
    this.cancelBubble(e);
    let target = <HTMLElement> e.target;
    let pNode = target.parentNode;
    this.renderer.setElementClass(pNode, 'open', switchFlag);
  }

  cancelBubble(e:MouseEvent) {
    // console.log("阻止冒泡:",e);
    e.stopPropagation();
    // e.preventDefault();
  }
search(){
  if(this.isDefault){
    this.searchFilter();
  }else{
    this.searchRun();
  }
}
  searchFilter() {
    this.setFilterEvent.emit({selectParams: this.selectParams, panelId: this.panel.panelID});
  }

  searchRun(){
    this.searchRunEvent.emit({selectParams: this.selectParams, panelId: this.panel.panelID});
  }
  stopBubble(e:Event) {
    e.stopPropagation();
  }

  showMembers(e:any, item:SinglePanelFilter) {
    item['showChildren'] = !item['showChildren'] ? true : false;
  }

  selectAllFn() {
    this.setFilterEvent.emit({selectParams: this.selectParams, panelId: this.panel.panelID});
  }
}

