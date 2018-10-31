import { Component ,ViewEncapsulation, ViewChild, ElementRef,Renderer,AfterViewInit } from '@angular/core';
// import { computeMinHeight } from '../../common/service/compute-min-height';
// import { flyIn }  from '../../animations'

@Component({
  selector:'data-set',
  templateUrl:'./data-set.component.html',
  styleUrls:['../data-center.component.scss'],
//   animations: [
//     flyIn
//   ]
})
export class DataSetComponent implements AfterViewInit{
  constructor(private renderer:Renderer){}
  ngAfterViewInit() {
  
  }
}
