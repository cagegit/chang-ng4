/**
 * Created by houxh on 2017-2-6.
 */
import {Component,ViewChild,ElementRef} from '@angular/core'
declare var Sonic:any;
@Component({
  selector:'mask-loading',
  templateUrl:'./loading.component.html'
})
export class LoadingComponent{
  @ViewChild('loading') loading:ElementRef;
  addSquareLoading(){
    var square = new Sonic({
      width: 100,
      height: 100,
      fillColor: '#000',
      path: [
        ['line', 10, 10, 90, 10],
        ['line', 90, 10, 90, 90],
        ['line', 90, 90, 10, 90],
        ['line', 10, 90, 10, 10]
      ]
    });
    square.play();
    this.loading.nativeElement.appendChild(square.canvas);
    // document.body.appendChild(square.canvas);
  }
  rmSquareLoading(){
    
  }
}
