/**
 * Created by fengjj on 2016/9/29.
 */
export interface BaseUser {
  id:string;
  displayName:string;
  filterFlag?:boolean;
  requireChange:boolean;
}
export interface BaseGroup {
  groupID:string;
  groupName:string;
}
export interface User extends BaseUser {
  //userName:string;
  headImg:string;
  email:string;
  telephone:string;
  title:string;
  permissions:boolean;
  section:string;
  groups:BaseGroup[];
  clone(u:User):UserClass;
}
export class UserClass implements User {
  id:string;
  displayName:string;
  //userName:string;
  headImg:string;
  email:string;  //等同于后台的userName
  telephone:string;
  title:string;
  permissions:boolean;
  section:string;
  requireChange:boolean;
  groups:BaseGroup[];
  constructor(u){
    this.id = u.userID;
    this.displayName = u.displayName;
    //this.userName = u.userName;
    this.headImg = u.userAvatar || '';
    this.email = u.userName;
    this.telephone = u.telephone || '填写手机号';
    this.title = u.position || '填写职位';
    this.permissions = u.isAdmin;
    this.section = u.department || '填写部门';
    this.groups = this.filterGroups(u.groupList) || [];
    this.requireChange = u.requireChange;
    //if(this.requireChange) {
    //  this.displayName = this.displayName+' (未激活)'
    //}
  }
  clone(u) {
    return new UserClass(u);
  }
  private filterGroups(groups) {
    if(groups && groups.length>0){
      return groups.filter((g) => {
        return g.groupID != 0;
      })
    }

  }
}
export class BaseUserClass implements BaseUser {
  id:string;
  displayName:string;
  filterFlag = true;
  requireChange:boolean;
  constructor(user) {
    this.id = user.userID;
    this.displayName = user.displayName;
    this.requireChange = user.requireChange;
    //if(this.requireChange) {
    //  this.displayName = this.displayName+' (未激活)'
    //}
  }
  matchName(name:string) {
    return this.filterFlag = this.displayName.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) > -1;
  }
}
