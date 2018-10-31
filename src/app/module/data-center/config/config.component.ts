import { Component ,ViewEncapsulation, ViewChild, ElementRef,Renderer,AfterViewInit } from '@angular/core';
// import { computeMinHeight } from '../../common/service/compute-min-height';
// import { flyIn }  from '../../animations'

@Component({
  selector:'config-form',
  templateUrl:'./config.component.html',
  styleUrls:['./config.component.css'],
//   animations: [
//     flyIn
//   ]
})
export class ConfigComponent implements AfterViewInit{
  constructor(private renderer:Renderer){}
  ngAfterViewInit() {
  
  }
}
