import {Component, OnInit, ViewChild} from '@angular/core';
import {UmGroupService} from "./um-group.service";
import {ModalDirective} from "ng2-bootstrap";
import {DomainFactory} from "../../../common/DomainFactory";
import {Response} from "@angular/http";
import {Group} from "../../../common/model/Group";
import {CFG} from "../../../common/CFG";
import {ActivatedRoute} from "@angular/router";

@Component({
  templateUrl:'./um-group.component.html',
  styleUrls:['./um-group.component.css'],
  providers:  [ UmGroupService ]
})
export class UmGroupComponent implements OnInit {
  @ViewChild('groupAddModal') public groupAddModal:ModalDirective;

  //分组列表
  private groupList : Group[] = [];
  private groupListAll : Group[] = [];
  //当前选中分组
  private curGroup : Group;
  private defaultGroupID : number;
  private searchTimer : any;

  //添加分组使用
  private groupName : string;
  //表单提交状态,防重复提交
  private submitted : boolean;

  private message : string;

  PERMISSION_GROUP_ADD : string=CFG.PERMISSION.GROUP_ADD;

  constructor(private route:ActivatedRoute,private groupService:UmGroupService) {

  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.defaultGroupID=params['id'];
      console.log("初始化:",params);
    });
    this.groupService.initGroupList().toPromise().then((response : Response)=>{
      let data=response.json();
      this.groupList=data.Groups.groupList.map((x)=>{
        return new Group(x.groupID,x.groupName);
      });
      if(!this.groupList){
        return;
      }

      if(this.defaultGroupID){
        this.curGroup=this.groupList.find((temp:Group)=>{
          return temp.groupId==this.defaultGroupID;
        });
      }
      if(!this.curGroup){
        this.curGroup=this.groupList[0];
      }
      this.groupListAll=this.groupList.filter(()=>{return true});
    }).catch((response : any)=>{
      let error=DomainFactory.buildError(response.json()).errMsg;
      console.error(error);
    })
  }

  /**
   * 更新当前选中分组
   * @param curGroup
     */
  updateCurGroup(curGroup : Group){
    this.curGroup=curGroup;
    console.info("当前选中",this.curGroup);
  }

  /**
   * 筛选分组列表
   * @param keyword
     */
  filterGruopList(keyword : string){
    clearTimeout(this.searchTimer);
    this.searchTimer=setTimeout(()=>{
      this.groupList=this.groupListAll.filter((temp:Group)=>{
        return new RegExp(keyword).test(temp.groupName);
      })
    },500);
  }

  /**
   * 添加分组
   * @param groupName
     */
  addGroupSubmit(){
    this.submitted=true;
    this.groupService.saveGroup(this.groupName).toPromise().then((response : Response)=>{
      console.info("添加结果:",response,response.json());
      let data=response.json().Group;
      let newGroup=new Group(data.groupID,data.groupName);
      console.log('newGroup',newGroup)
      this.groupListAll.push(newGroup);
      this.groupList.push(newGroup);
      console.log( this.groupListAll,this.groupList)
      this.hideModal();
    }).catch((response : any)=>{
      this.message=DomainFactory.buildError(response.json()).errMsg;
    })
      this.submitted=false;
  }

  deleteGroup(group : Group){
    console.info("删除",group);
    this.groupListAll=this.groupListAll.filter((temp : Group)=>{
      return group.groupId!=temp.groupId;
    });

    this.groupList=this.groupListAll.filter((temp : Group)=>{
      return group.groupId!=temp.groupId;
    });

    this.curGroup=this.groupList[0];

  }

  hideModal(){
    this.groupName = '';
    this.groupAddModal.hide();
  }


  }
