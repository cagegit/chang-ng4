/**
 * Created by fengjj on 2016/9/29.
 */
import { Component ,Input ,OnChanges ,SimpleChanges ,OnInit } from '@angular/core';
import { Router, ActivatedRoute ,Params } from '@angular/router';
import { BaseUser } from './user.model';
@Component({
  selector:'user-list',
  template:''
})
export class UserListComponent implements  OnChanges ,OnInit {
  @Input() userList:BaseUser[];
  curUser:BaseUser;
  initFlag = false;
  constructor(private route: ActivatedRoute,private router: Router){}
  ngOnInit() {
    console.log(this.route.children);
  }
  ngOnChanges(changes:SimpleChanges) {
    if(changes['userList'].currentValue && !this.initFlag) {
      this.curUser = changes['userList'].currentValue[0];
      console.log(this.curUser);
      this.router.navigate(['./'+this.curUser.id], { relativeTo: this.route });
    }
  }
  onClick(u:BaseUser) {
    this.curUser = u;
  }
}
