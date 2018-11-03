import { Component ,OnInit ,ViewChild , AfterViewInit } from '@angular/core';
import { UmUserService } from './um-user.service';
import {ActivatedRoute, Router,Params} from "@angular/router";
import { BaseUser ,User ,UserClass ,BaseUserClass } from './user.model';
import { Subject } from "rxjs/Subject";
import { Observable } from 'rxjs/Observable'
import "rxjs/add/operator/debounceTime";
import {stringify} from "querystring";
import {AppContext} from "../../../common/AppContext";
import  {User as CommonUser} from '../../../common/model/User';
import { AppNotification } from '../../../app.notification'
import {CFG} from "../../../common/CFG";
import {ModalDirective} from "ngx-bootstrap";
@Component({
  templateUrl:'./um-user.component.html',
  styleUrls:['./um-user.component.css']
})
export class UmUserComponent implements OnInit ,AfterViewInit {
  @ViewChild('userAddModal') userAddModal:ModalDirective;
  userList:BaseUserClass[];
  curUser:BaseUserClass;
  detailUser:User;
  submited = true;
  domainName:string;
  userID:string;
  isEmail = true;
  groups:Array<{[key:string]:string}>;
  initUser = {
    "userName":"",
    "displayName":"",
    "isAdmin":0,
    "groupName":''
  }
  loginUser:CommonUser;
  private searchTermStream = new Subject<string>();
  PERMISSION_USER_ADD : string=CFG.PERMISSION.USER_ADD;
  private emailReg = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,}){1,})$/;
  constructor(private route:ActivatedRoute, public router:Router,private userService:UmUserService,private appContext : AppContext, private appNotification:AppNotification) {
    this.loginUser = this.appContext.user;
    this.route.params.subscribe((obj:{[key:string]:any}) => {
      if(this.curUser){
        if(obj["id"]){
          this.curUser = this.getUserByID(obj['id']);
        }else {
          this.curUser = this.userList[0];
        }
        this.getDetailUser(this.curUser.id);
      }
    })
  }
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userID = params['id'];
    });
    //头部添加用户 直接进入添加弹出层
    this.route.queryParams.subscribe((params:Params) => {
      if(params['isAdd'] == 1){
        setTimeout(()=>{
          this.show();
        },0)
      }
    })
    /**
     * 订阅用户列表可观观察者
     */
    this.userService.userListSubject.subscribe((d:BaseUserClass[]) => {
      console.log('userList1',d);
      if(d){
        this.userList = d;
      }else {
        return false;
      }
      if(this.curUser && !this.hasUserInUserList(this.curUser)){
        this.curUser = this.userList[0];
        this.router.navigateByUrl(`/um/user/${this.curUser.id}`);
        //this.getDetailUser(this.curUser.id);
        return false;
      }
      if(!this.curUser) { //初次实例化组件
        if(this.userID){
          this.curUser = this.getUserByID(this.userID);
        }else{
          this.curUser = this.userList[0];
        }
        this.getDetailUser(this.curUser.id);
      }
      this.router.navigateByUrl(`/um/user/${this.curUser.id}`);
    })
    /***
     * 订阅用户详情可观观察者
     */
    this.userService.userDetailSubject.subscribe((u:UserClass) => {
      if(u) {
        this.detailUser = u;
      }
    })
    /**
     * 搜索流处理
     */
    this.searchTermStream.debounceTime(300).distinctUntilChanged()
      .switchMap((term: string) => {return Observable.of(term) }).subscribe((term) => { this.filterUserList(term);});
    this.userService.getUsersList();

    this.userService.getGroups().subscribe((d:any) => {
      this.groups = d.Groups.groupList;
      let firstGroup = this.groups[0] as any;
      //console.log('firstGroup',firstGroup,this.initUser)
      this.initUser.groupName = firstGroup?firstGroup.groupName:'';
    })
    this.userService.domainName.subscribe((domain:string) => {
      this.domainName = domain;
    })
    /***
     *
     */
    this.userService.inviteSuccess.subscribe((b:boolean) => {
      if(b) {
        this.userAddModal.hide();
      }
    })
  }
  ngAfterViewInit() {
  }
  show(){
    this.userAddModal.show();
  }
  /**
   * 改变当前选中用户 并获取选中的用户
   * @param u 当前选中的用户
   */
  changeCurUser(u:BaseUserClass) {
    this.curUser  = u;
    this.router.navigateByUrl(`/um/user/${this.curUser.id}`);
    //this.getDetailUser(this.curUser.id);
  }

  /**
   * 搜索
   * @param item
   */
  search(item:string) {
    this.searchTermStream.next(item);
  }
  onSubmit() {
    this.submited = true;
    this.userService.addUser(this.initUser);
    //this.userService.addUser(this.initUser).subscribe((b:boolean) => {
    //  console.log('newUser',b);
    //  if(b) {
    //    console.log(this.userAddModal)
    //    this.userAddModal.hide();
    //  }else {
    //    this.submited = false;
    //    //this.appNotification.error('邀请信用')
    //  }
    //});
  }
  /**
   * 获取用户详细信息
   * @param id 需要用到的用户id
   */
  onChangeName(value:string){
    this.initUser.displayName = value;
  }
  onChangeEmail(value:string){
    this.isEmail = this.emailReg.test(value);
  }
  private getDetailUser(id:string) {
    this.userService.getUserDetail(this.curUser.id);
  }

  /**
   * matchName通过调用ｕｓｅｒ的方法设置user的filterFlag属性
   * @param item
   */
  private filterUserList(item:string) {
    for(let u of this.userList) {
      u.matchName(item);
    }
  }
  private getUserByID(id:string) :BaseUserClass{
    for(let u of this.userList){
      if(u.id ==id){
        return u;
      }
    }
  }
  private hasUserInUserList(user:BaseUserClass){
    for(let u of this.userList){
      if(u.id === user.id){
        return true;
      }
    }
    return false;
  }

}


