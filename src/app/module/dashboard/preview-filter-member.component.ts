/**
 * Created by houxh on 2017-3-31.
 */
import {Component, Input, ViewChild, ElementRef,OnInit,Output,EventEmitter} from '@angular/core';
import {SinglePanelFilter, SelectParam} from "../../common/model/dashboard.model";
import {Member} from "../../common/model/card/card.query.template";
@Component({
  selector: 'filter-member',
  templateUrl: './preview-filter-member.component.html',
  styleUrls: ['./preview-filter-member.component.css']
})
export class PreviewFilterMemberComponent implements OnInit{

  // @Input() show:boolean;
  @Input() filter:SinglePanelFilter;
  @ViewChild('filterMemberBox') filterMemberBox:ElementRef;
  @Input() selectParams:Array<SelectParam>;
  @Input() defaultParams:Array<SelectParam>;
  @Output() changeSelectParamEvent=new EventEmitter<any>();
  isSelectAll:boolean=false;
  members:Member[];
  ngOnInit():void {
    this.members=this.filter['data'] as Member[];
    this.setSelectMember();
  }
  setSelectMember(){
    if(this.members){
      let curSelectParams=new SelectParam();
      if(this.selectParams) {
        this.selectParams.forEach(s=> {
          if (s.name == this.filter.uniqueName)
            curSelectParams = s;
        });
      }

      if(curSelectParams&&curSelectParams.value){
        this.members.forEach(m=>{
          let nameArr=m.uniqueName.split('].[');
          let hierarchyName=nameArr[0]+'].['+nameArr[1]+']';
           m['showName']=m.uniqueName.replace(hierarchyName+'.','').replace(/\]\.\[/g,'-').replace(/\]|\[/g,'');
          m['selected']=false;
          curSelectParams.value.forEach(cv=>{
            if(cv==m.uniqueName){
              m['selected']=true;
            }
          })
        })
      }
    }
  }
  selectMember(e:any, member:Member,paramName:string) {
    if (!this.selectParams) {
      this.selectParams = new Array<SelectParam>();
    }
    if (e.target.checked) {
      //add
      let ind = this.selectParams.findIndex(param=> {
        if (param.name == paramName) {
          if (param.value.length > 0) {
            param.value.push(member.uniqueName);
          } else {
            param.value = [member.uniqueName];
          }
          return true;
        }
      })
      if (ind == -1) {
        let selected = new SelectParam();
        selected.name =paramName;
        selected.value = [member.uniqueName];
        this.selectParams.push(selected);
      }
      this.members.forEach(m=>{
        if(m.uniqueName==member.uniqueName){
          m['selected']=true;
        }
      })
    } else {
      //del
      this.selectParams.forEach(param=> {
        if (param.name == paramName) {
          if (param.value.length > 0) {
            let mIndex=param.value.findIndex(m=>{
              if(m==member.uniqueName) return true;
            });
            if(mIndex>=0)
              param.value.splice(mIndex,1);
          }
        }
      })
      this.members.forEach(m=>{
        if(m.uniqueName==member.uniqueName){
          m['selected']=false;
        }
      })
    }
this.changeSelectParamEvent.emit({members:this.selectParams});
  }

  selectAll(e:any,paramName:string) {
    this.isSelectAll=this.isSelectAll?false:true;
    this.selectParams.forEach(sp=>{
      if(sp.name==paramName){
        sp.value=[];
      }
    });
    if(this.isSelectAll){
      this.members.forEach(m=>{
        m['selected']=true;
      })
    }else{
      this.members.forEach(m=>{
        m['selected']=false;
      })
    }
    this.changeSelectParamEvent.emit({members:this.selectParams});
  }

  setDefault(e:any,paramName:string) {
    this.defaultParams.forEach(cp=> {
      if(cp.name==paramName) {
        let valArr = [];
        cp.value.forEach(cv=> {
          valArr.push(cv);
        })
        this.selectParams.forEach(sp=>{
          if(sp.name==paramName){
            sp.value=valArr;
          }
        });
      }
    })
    this.setSelectMember();
    this.changeSelectParamEvent.emit({members:this.selectParams,setDefault:true});
  }
}
