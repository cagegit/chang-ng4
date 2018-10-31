/**
 * Created by fengjj on 2016/9/29.
 */
import {Component, Input, ViewChild,OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {UmUserService} from "./um-user.service";
import {User} from "./user.model";
import {FileUploader, ParsedResponseHeaders} from "ng2-file-upload/ng2-file-upload";
import {AppNotification} from "../../../app.notification";
import {AppContext} from "../../../common/AppContext";
import {CFG} from "../../../common/CFG";
import { User as CommonUser} from "../../../common/model/User";
import {ResourcePermission} from "../../../common/model/resource-permission.model";
import { Error } from '../../../common/model/Error'
@Component({
  selector :'user-detail',
  templateUrl:'./user-detail.component.html',
  styleUrls:['./user-detail.component.css']
})
export class UserDetailComponent  {

  @Input() user:User;
  @ViewChild('resetPasswordModal')  resetPasswordModal;
  errorFlag = {
    newPasswordErr:false,
    pswConfirmErr:false,
    oldPasswordErr:false,
    consistencyErr:false,
    formErr:true

  }
  password = {
    oldPassword:'',
    newPassword:'',
    confirmPassword:''
  }
  loginUser:CommonUser;
  editer = {
    department:false,
    position:false,
    mobile:false
  }
  public uploader:FileUploader;
  RESOURCE_TYPE_USER : string=ResourcePermission.RESOURCE_TYPE.USER;


  constructor(private route:ActivatedRoute ,private router:Router,private userService:UmUserService ,private appNotification : AppNotification,private appContext : AppContext){
    let self = this;
    this.loginUser = this.appContext.user;
    console.log('dd',this.loginUser);
    this.userService.editSuccess.subscribe(() => {
      this.hideEidter();
      //this.editer[k] = false;
    })

    this.uploader=new FileUploader({
      url: CFG.API.USER+'/avatar',
      // url : 'http://datasee.csdn.net/csdn-das-usermgt/0.0.5/users/avatar',
      autoUpload: true,
      allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      maxFileSize: 5*1024*1024 // 5 MB
    });
    this.uploader.onErrorItem=function(item: any, response: string, status: number, headers: ParsedResponseHeaders){
      self.appNotification.error('上传头像失败!');
      console.error("用户头像上传失败",item,response,status,headers);
      // this.appNotification.success("图片上传失败!");
    }
    document.body.addEventListener('click',()=>{
      this.hideEidter();
    });
  }
  onDeleteUser(id:string) {
    this.userService.deleteUser(this.user.id,this.user.email);
  }
  onDeleteGroup(groupID:string,userID:string) {
    this.userService.deleteGroup(groupID,userID);
  }

  onSubmit(values:any) {
    let obj = {};
    obj['userPassword'] = values['newPassword'];
    obj['userOldPassword'] = values['oldPassword'];
    this.userService.updatePwd(this.user.email,values['newPassword'],values['oldPassword']).subscribe((d:any) => {
      this.resetPasswordModal.hide();
      for(let key in this.password){
        this.password[key] = '';
      }
    },(err:Error) => {
      this.appNotification.error(err.errMsg);
    })
  }
  onSaveHandle(val:any,oldVal:any,key:string,userName:string){
    console.log(val,oldVal,key,userName);
    if(val != oldVal) {
      let obj = {};
      obj[key] = val;
      this.userService.editUser(obj,userName);
    }else {
      this.hideEidter(key);
    }
  }

  showEditer(e:MouseEvent,k:string) {
    this.cancelBubble(e);
    this.hideEidter();
    this.editer[k] = true;
  }
  hideEidter(key?:string) {
    if(key){
      this.editer[key] = false;
    }else {
      for(let k in this.editer){
        this.editer[k] = false;
      }
    }
  }
  changeAdminFn(value:boolean){
    this.user.permissions = value;
    this.onSaveHandle(value,!value,'isAdmin',this.user.email);
    console.log(value);
  }

  private authPasswd(string:string) {
    if(string.length >=6) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
        return 3
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /[^a-zA-Z0-9]+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          return 2;
        }else if(/\[a-zA-Z]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
          return 2;
        }else if(/[0-9]+/.test(string) && /[^a-zA-Z0-9]+/.test(string)) {
          return 2;
        }else{
          return 1
        }
      }
    }else{
      return null ;
    }
  }

  private blurFn(key:string,b = false){
    let grade = this.authPasswd(this.password[key]);
    let oldPasswordGrade = this.authPasswd(this.password['oldPassword']);
    let newPasswordGrade = this.authPasswd(this.password['newPassword']);
    let confirmPasswordGrade = this.authPasswd(this.password['confirmPassword']);
    if(grade){
      this.errorFlag[key+'Err'] = false;
      //this.errorFlag.formErr = false;
      if(b && !(this.password.newPassword == this.password.confirmPassword)){
        this.errorFlag.consistencyErr = true;
        return false;
        //this.errorFlag.formErr = true;
      }else{
        this.errorFlag.consistencyErr = false;
      }
      if(oldPasswordGrade && newPasswordGrade && confirmPasswordGrade){
        this.errorFlag.formErr = false;
      }
    }else {
      this.errorFlag[key+'Err'] = true;
      this.errorFlag.formErr = true;
    }

  }
  private selectHeadImg($event:any){
    if(!this.user.requireChange&&(this.loginUser.userId+'' == this.user.id)){
      document.getElementById('userHeadImgFile').click();
    }else{
      // this.appNotification.error();
    }

  }

  private uploadImage($event){
    var self=this;
    this.uploader.onSuccessItem=function(item: any, response: string, status: number, headers: ParsedResponseHeaders){
      let userHeadImg=JSON.parse(response).UserAvatar.userAvatar;
      console.log("上传成功:",userHeadImg,'开始编辑用户头像...');
      //上传成功后,下次登录,刷新页面服务端重新返回用户头像信息
      self.user.headImg=userHeadImg;
      if(self.user.id==self.appContext.user.userId+''){
        self.appContext.user.userHeadImg= self.user.headImg;
        self.appContext.user=self.appContext.user;
      }
    }
  }
  cancelBubble(e:MouseEvent){
    e.stopPropagation();
  }
}
//export class UserDetailComponent implements OnInit{
//  ngOnInit() {
//
//  }
//}
