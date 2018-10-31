
import {Component, Input, OnInit, Output, OnChanges, SimpleChange} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Group, DataSet} from "./group.model";
import {UmGroupService} from "./um-group.service";
import {EventEmitter} from "@angular/core";
import {Response} from "@angular/http";
import {User} from "../../../common/model/User";
import {DomainFactory} from "../../../common/DomainFactory";
import {AppNotification} from "../../../app.notification";
import {ResourcePermission} from "../../../common/model/resource-permission.model";
@Component({
  selector:'um-group-detail',
  templateUrl:'./um-group-detail.component.html',
  styleUrls:['./um-group-detail.component.css']
})
export class UmGroupDetailComponent implements OnInit,OnChanges {
  @Input() group:Group;
  @Output() deleteGroupEvent = new EventEmitter<Group>();

  private userList : User[];
  private dataSetList : DataSet[];

  public selected:string = '';
  public userListAll : User[];

  public selectedDataSet:string = '';
  public dataSetListAll : DataSet[];
  editer = {
    groupName:false
  }

  RESOURCE_TYPE_GROUP : string=ResourcePermission.RESOURCE_TYPE.GROUP;


  constructor(private route:ActivatedRoute ,private router:Router,private groupService:UmGroupService,private appNotification : AppNotification ){
      console.info("初始化UmGroupDetailComponent",this.group);
  }
  ngOnInit(){
      console.info("初始化数据");
      this.groupService.findUserAll().toPromise().then((response : Response)=>{
        let data=response.json();
        this.userListAll=data.Users.userList.map((x)=>{
          return User.buildFromUserDTO(x);
        });
        console.log("this.userListAll",JSON.stringify(this.userListAll));
      }).catch((response : any)=>{
        let error=DomainFactory.buildError(response.json()).errMsg;
        console.error(error);
      })

      this.groupService.findDataSetAll().subscribe((data)=>{
        this.dataSetListAll=data;
      })

  }


  selectAddUser(e:any){
    let user=e.item;
    this.groupService.addUser(this.group.groupId,user.userId).subscribe(()=>{
       if(!this.userList.find((temp : User)=>{
            return temp.userId==user.userId;
       })){
         this.userList.push(user);
       }
    })
  }

  selectAddDataSet(e:any){
    console.info("选中数据集",e.item);
    let dataSet=e.item;
    this.groupService.addDataSet(this.group.groupId,dataSet.dataSetId).subscribe(()=>{
      if(!this.dataSetList.find((temp : DataSet)=>{
          return temp.dataSetId==dataSet.dataSetId;
        })){
        this.dataSetList.push(dataSet);
      }
    })
  }

  /**
   * 初始化详情页用户组列表 和 数据集列表
   */
  initGroupDetail(groupId : number){
      this.groupService.getGroup(groupId).toPromise().then((response : Response)=>{
        console.log(response);
        let data=response.json();
        if(!data.Group.userList){
          this.userList=[];
        }else{
          this.userList=data.Group.userList.map((x)=>{
            return User.buildFromUserDTO(x);
          })
        }

      }).catch((response : any)=>{
        let error=DomainFactory.buildError(response.json()).errMsg;
        console.error(error);
      })

        //noinspection TypeScriptValidateTypes
        this.groupService.getDataSetList().subscribe(data=>this.dataSetList=data);
  }

  // ngOnChanges(changes: Sim
  // pleChange){
  //   let group=changes["group"].currentValue;
  //   if(group){
  //     this.initGroupDetail(group.groupId);
  //   }
  // }

  ngOnChanges(changes: {[group: string]: SimpleChange}) {
    let group=changes["group"].currentValue;
    if(group){
      this.initGroupDetail(group.groupId);
      this.group=group;
      console.info("change:this.group-",this.group);
    }
  }




  deleteGroup(){
    console.info("删除当前分组:",this.group.groupId);
    this.groupService.deleteGroup(this.group.groupId).subscribe(()=>{
      this.deleteGroupEvent.emit(this.group);
      this.appNotification.success('删除成功!')
    });
  }

  deleteUser(user : User){
    console.info("删除用户",user);
    this.groupService.deleteUser(this.group.groupId,user.userId).subscribe(()=>{
      this.userList=this.userList.filter((temp : User)=>{
        return user.userId!=temp.userId;
      });
    });

  }

  deleteDataSet(dataSet : DataSet){
    console.info("删除数据集",dataSet);
    this.groupService.deleteDataSet(this.group.groupId,dataSet.dataSetId).subscribe(()=>{
      this.dataSetList=this.dataSetList.filter((temp : DataSet)=>{
        return dataSet.dataSetId!=temp.dataSetId;
      });
    });
  }

  updateGroupName(groupName : string){
    console.info("编辑内容:",groupName);
    this.groupService.updateGroup(this.group.groupId,groupName).toPromise().then((response : Response)=>{
      this.group.groupName=groupName;
      this.editer['groupName'] = false;
    }).catch((response : any)=>{
      let error=DomainFactory.buildError(response.json()).errMsg;
      this.appNotification.error(error);
    })
    this.editer['groupName'] = false;
  }

  showEditer(k:string) {
    this.editer[k] = true;
    // console.log(this.editer)
  }
  hideEidter(k:string) {
    this.editer[k] = false;
    //console.log(this.editer)
  }


}
