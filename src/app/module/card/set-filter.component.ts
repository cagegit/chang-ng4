/**
 * Created by fengjj on 2016/12/2.
 */
import {Component, ViewChild, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {ModalDirective} from "ng2-bootstrap";
import {CardService} from "../../common/service/card.service";
import * as query from "../../common/model/card/card.query.template";
import {TemplateHelper} from "./templateHelper";
import {Hierarchy} from "../../common/model/card/card.query.template";
import { DataHandleService } from '../../changan/data.handle.service';
@Component({
  selector: 'set-filter',
  templateUrl: './set-filter.component.html',
  styleUrls: ['./set-filter.component.css']
})
export class SetFilterComponent {
  // @Input() cube:string;
  // @Input() queryModel:query.QueryTemplate;
  @Input() helper:TemplateHelper;
  @Input() autoExecute:boolean;
  @ViewChild('setFilterBox') setFilterBox:ModalDirective;
  @ViewChild('willSelectList') willSelectList:ElementRef;
  @ViewChild('all') all:ElementRef;
  members:FilterMember[];
  initMembers:FilterMember[] = [];
  selectedMembers:query.Member[] = [];
  axis:string;
  hierarchy:Hierarchy;
  levelName:string;
  levelCaption:string;
  parameter:string = '';
  memberCount:number;
  selectMemberCount:number = 0;
  memberType:string = 'INCLUSION';
  @Output() checkRun = new EventEmitter<any>();

  constructor(private cardService:CardService,private dataHandleSer: DataHandleService) {

  }

  showModal(axisName:string, item:any, lvName:string) {
    this.members=[];
    this.selectedMembers=[];
    this.parameter='';
    this.axis = axisName;
    this.hierarchy = item;
    item.levels.forEach(l=>{
      if(l.name==lvName){
        this.levelCaption =l.caption;
      }
    })
    this.levelName=lvName;
    let hierarchySimpleName=item.name.replace('['+item.dimension+'].','').replace(/\[|\]/g,'');
    let model = this.helper.model();
    this.dataHandleSer.getMember(model.cube,item.dimension, hierarchySimpleName, lvName).subscribe(rep=> {
      this.initMembers = [];
      let members = rep.data as query.Member[];
      let hierarchy = this.helper.getHierarchy(item.name);
      let selection = hierarchy.levels[lvName].selection;
      if (selection && selection.members.length > 0) {
        console.log('selection:',selection);
        this.memberType=selection.type;
        this.selectedMembers = selection.members;
        this.selectedMembers.forEach(sm=>{
          let mName=sm.uniqueName.replace(item.name+'.','');
          sm.name =mName.split('.').length>1?mName:sm.name; //m.name;
        })
      }
      members.forEach(m=> {
        let newMember = new FilterMember();
        newMember.caption = m.caption;
        let mName=m.uniqueName.replace(item.name+'.','');
        newMember.name =mName.split('.').length>1?mName:m.name; //m.name;
        newMember.uniqueName = m.uniqueName;
        newMember.visible = this.selectedMembers.findIndex(sm => {
          return sm.uniqueName == m.uniqueName;
        }) >= 0;
        this.initMembers.push(newMember);
      });
      this.initMembers.sort((a,b)=>{
        let aArr=a.name.replace(/[\[\]]/g,'').split('.');
        let bArr=b.name.replace(/[\[\]]/g,'').split('.');
        if(!isNaN(parseInt(aArr[0]))&&!isNaN(parseInt(bArr[0]))){
          if(aArr.length>1){
            if(parseInt(aArr[0])-parseInt(bArr[0])==0){
              if(aArr.length==3){
               if(parseInt(aArr[1])-parseInt(bArr[1])==0){
                 return parseInt(aArr[2]) - parseInt(bArr[2]);
               } else{
                 return parseInt(aArr[1]) - parseInt(bArr[1]);
               }
              }else {
                return parseInt(aArr[1]) - parseInt(bArr[1]);
              }
            }else {
              return parseInt(aArr[0]) - parseInt(bArr[0]);
            }

          }else{
             return parseInt(aArr[0])-parseInt(bArr[0]);
          }
        }
          return 0;
      })
      this.members = this.initMembers;
      // this.members = rep.ArrayList as query.Member[];

      this.memberCount = this.initMembers.length;
      if (selection && selection.parameter) {
        this.parameter = selection.parameter;
      }
    });
    this.setFilterBox.show();
  }

  closeModal() {
    this.clearAll();
    this.setFilterBox.hide();
  }

  clearAll() {
    let input = this.all.nativeElement;
    input.checked=false;
    this.selectedMembers = [];
    this.selectMemberCount = 0;
    this.members.forEach(m=> {
      m.visible = false;
    })
  }

  filterMember(key:string) {
    let filterMembers = [];
    if (key && key != '') {
      for(let j=0,len=this.initMembers.length;j<len;j++){
        if(this.initMembers[j]&&this.initMembers[j].name.toLowerCase().indexOf(key) >= 0){
          filterMembers.push(this.initMembers[j]);
        }
      }
      this.members = filterMembers;
    } else {
      this.members = this.initMembers;
    }
    this.memberCount = this.members.length;
  }

  selectMember(event:Event, item:FilterMember) {
    let checked = event.target['checked'];
    if (checked) {
      this.addMember(item);
    } else {
      this.delMember(item);
    }
    this.selectMemberCount = this.selectedMembers.length;
    // console.log(this.selectedMembers);
  }
  setFilterName(event:Event){
    let checked = event.target['checked'];
    if (checked) {
      this.parameter=this.hierarchy.name+'.['+this.levelName+']';
    } else {
      this.parameter='';
    }
  }
  addMember(item:FilterMember) {
    let hasMember = false;
    this.members.forEach(m=> {
      if (m.name == item.name) {
        m.visible = true;
      }
    });
    this.selectedMembers.forEach(s=> {
      if (s.name == item.name) {
        hasMember = true;
        return;
      }
    });
    if (!hasMember) {
      let member = new query.Member();
      member.name = item.name;
      member.caption = item.caption;
      member.uniqueName = item.uniqueName;
      this.selectedMembers.push(member);
    }
  }

  delMember(item:FilterMember) {
    let index = 0;
    for (let i = 0; i < this.selectedMembers.length; i++) {
      if (this.selectedMembers[i].name == item.name) {
        index = i;
      }
    }
    this.selectedMembers.splice(index, 1);
    this.members.forEach(m=> {
      if (m.name == item.name)
        m.visible = false;
    });
  }

  saveMember() {
    let model = this.helper.model();
    let curHierarchy = this.helper.getHierarchy(this.hierarchy.name);
    let keys=Object.keys(curHierarchy.levels);
    let index=keys.findIndex(l=>{if(l==this.levelName) return true;});
    if(index!=-1){
      for(let i=0;i<=index;i++){
        console.log('filter:',this.levelName,this.memberType);
        if(curHierarchy.levels[keys[i]].caption==this.levelCaption) {
          curHierarchy.levels[keys[i]].selection = {
            type: this.memberType,
            parameter: this.parameter,
            members: this.selectedMembers
          };
        }
        // else{
        //   let thisSelecton=curHierarchy.levels[keys[i]].selection;
        //   if(!thisSelecton){
        //     curHierarchy.levels[keys[i]].selection = {
        //       type: this.memberType,
        //       parameter: this.hierarchy.name+'.['+curHierarchy.levels[keys[i]].name+']',
        //       members: []
        //     };
        //   }
        // }
      }
    }else {
      curHierarchy.levels[this.levelName].selection = {
        type: this.memberType,
        parameter: this.parameter,
        members: this.selectedMembers
      };
    }

    this.closeModal();
    if(this.autoExecute) {
      this.checkRun.emit();
    }
  }

  changeMemberType(type:string) {
    this.memberType = type;
  }

  changeAllChecked(checked:boolean) {
    // console.log(checked);
    let inputNodes = this.willSelectList.nativeElement.getElementsByTagName('input');
    inputNodes = Array.from(inputNodes);
    // node.checked = !node.checked;
    for (let input of inputNodes) {
      input.checked = checked;
    }
    if (checked) {
      this.selectedMembers = [];
      this.members.forEach(m=> {
        m.visible = true;
        let member = new query.Member();
        member.name = m.name;
        member.caption = m.caption;
        member.uniqueName = m.uniqueName;
        this.selectedMembers.push(member);
      });
    } else {
      this.members.forEach(m=> {
        m.visible = false;
      });
      this.selectedMembers = [];
    }
  }
}
export class FilterMember {
  caption:string;
  uniqueName:string;
  name:string;
  visible:boolean;
}
