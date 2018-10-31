import { Component ,ViewChild ,ElementRef,AfterViewInit ,Renderer } from '@angular/core';
import { computeMinHeight } from '../../common/service/compute-min-height';
import { flyIn } from '../../animations';

@Component({
  templateUrl:'./forward.component.html',
  styleUrls:['./forward.component.css'],
  animations: [
    flyIn
  ]
})
export class ForwardComponent implements AfterViewInit {
  @ViewChild('forward') forward:ElementRef;
  constructor(private renderer:Renderer){}
  ngAfterViewInit() {
    computeMinHeight.setMinHeight(this.renderer,this.forward.nativeElement,true);
  }
}