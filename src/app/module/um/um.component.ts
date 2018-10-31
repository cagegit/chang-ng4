import { Component ,ViewChild ,ElementRef,AfterViewInit ,Renderer } from '@angular/core';
import { computeMinHeight } from '../../common/service/compute-min-height';
import { flyIn,dropDown } from '../../animations'

@Component({
  templateUrl:'./um.component.html',
  styleUrls:['./um.component.css'],
  animations: [
    flyIn
  ]
})
export class UmComponent implements AfterViewInit {
  @ViewChild('userManage') userManage:ElementRef;
  showDropDown:boolean = false;
  constructor(private renderer:Renderer){}
  ngAfterViewInit() {
    computeMinHeight.setMinHeight(this.renderer,this.userManage.nativeElement,true);
  }
  showDropDownFun (){
    this.showDropDown = !this.showDropDown;
  }
}
