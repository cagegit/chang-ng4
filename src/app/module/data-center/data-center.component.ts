import { Component ,ViewEncapsulation, ViewChild, ElementRef,Renderer,AfterViewInit } from '@angular/core';
import { flyIn }  from '../../animations'
import { Router } from "@angular/router";

@Component({
  templateUrl:'./data-center.component.html',
  styleUrls:['./data-center.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    flyIn
  ]
})
export class DataCenterComponent implements AfterViewInit{
  @ViewChild('dataCenter') dataCenter:ElementRef;
  constructor(private renderer:Renderer, public router: Router,){}
  ngAfterViewInit() {
   
  }
}
