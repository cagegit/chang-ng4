/**
 * Created by fengjj on 2017/5/15.
 */
import { Component ,Input } from '@angular/core'
@Component({
  selector:'no-content',
  templateUrl:'./no-content.component.html',
  styleUrls:['./no-content.component.css']
})
export class NoContentComponent {
  @Input() style:{width:number,height:number};
  @Input() imgSrc:string;
  @Input() text:string;
}
