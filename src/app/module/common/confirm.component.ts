/**
 * Created by houxh on 2017-1-17.
 */
import {Component,Output,EventEmitter,ViewChild} from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";
@Component({
  selector:'alert-confirm',
  styleUrls:['./confirm.component.css'],
  templateUrl:'./confirm.component.html'
})
export class ConfirmComponent{
  @Output() confirm = new EventEmitter<any>();
  // @Output() cancel = new EventEmitter<any>();
  @ViewChild('assertConfirm') assertConfirm:ModalDirective;
  args:string[];
  message:string;
  title:string;
  isDelete=true;
  open(title:string,message:string,...args: string[]){
    this.message=message;
    this.title=title;
    this.args=args;
    if(args.length>0&&args[0]!='del'){
      this.isDelete=false;
    }
    this.assertConfirm.show();
  }
  close(){
    this.assertConfirm.hide();
  }
  makeConfirm(){
    console.log('makeConfirm args:',this.args);
    if(this.args.length>0) {
      this.confirm.emit(this.args.join(" "));
    }else{
      this.confirm.emit();
    }
    this.assertConfirm.hide();
  }
}

