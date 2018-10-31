/**
 * Created by fengjj on 2017/3/30.
 */
import { Component } from '@angular/core';
@Component({
  selector:'crumbs',
  styles:[`
    .self_crumbs{ height: 40px; line-height: 40px; padding-left:20px; position: relative; cursor: default;}
    .self_crumbs:before{content:''; position: absolute;height: 4px; width: 4px; font-size: 0; line-height: 0; overflow: hidden; background-color: #313447; border-radius: 50%; left:4px; top:18px; }
  `],
  template:`
    <div class="self_crumbs">
      <ng-content></ng-content>
    </div>
  `
})
export class CrumbsComponent {

}
