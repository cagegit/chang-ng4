import { Component ,ViewChild ,ElementRef,AfterViewInit ,Renderer } from '@angular/core';
import { computeMinHeight } from '../../common/service/compute-min-height';
import { flyIn,dropDown } from '../../animations'

@Component({
  templateUrl:'./protocol.component.html',
  styleUrls:['./protocol.component.css'],
  animations: [
    flyIn
  ]
})
export class ProtocolComponent implements AfterViewInit {
  @ViewChild('protocol') protocol:ElementRef;
  showDropDown:boolean = false;
  constructor(private renderer:Renderer){}
  ngAfterViewInit() {
    computeMinHeight.setMinHeight(this.renderer,this.protocol.nativeElement,true);
  }
  showDropDownFun (){
    this.showDropDown = !this.showDropDown;
  }
}1