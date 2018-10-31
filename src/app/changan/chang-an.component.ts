import { Component , AfterViewInit} from '@angular/core';
import { flyIn} from '../animations'

@Component({
  templateUrl:'./chang-an.component.html',
  styleUrls:['./chang-an.component.scss'],
  animations: [
    flyIn
  ]
})
export class ChangAnComponent implements AfterViewInit{
  showDropDown:boolean = false;
  constructor(){}
  ngAfterViewInit() {
    // computeMinHeight.setMinHeight(this.renderer,this.content.nativeElement,true);
  }
  showDropDownFun (){
    this.showDropDown = !this.showDropDown;
  }
}
