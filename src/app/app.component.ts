import { Component,ViewEncapsulation,AfterViewInit,OnInit } from '@angular/core';
/*
 * App Component
 * Top Level Component
 */
export const ROOT_SELECTOR = 'app';
@Component({
  selector: ROOT_SELECTOR,
  encapsulation: ViewEncapsulation.None,
  template:`<router-outlet></router-outlet>`,
  styleUrls: [
    './app.component.scss'
  ]
})
export class AppComponent implements OnInit,AfterViewInit{
    constructor() {
    }
    ngOnInit() {
      console.log('开始绑定定！');
      // document.getElementById('loadingBox').style.display='block';
    }
    ngAfterViewInit() {
      console.log('app is ready!');
      //document.getElementById('loadingBox').style.display='none';
    }
}
