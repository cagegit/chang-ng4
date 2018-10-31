/**
 * Created by fengjj on 2017/4/11.
 */
import { Component } from '@angular/core'
@Component({
  template:`
    <div class="app_template">
      <router-outlet></router-outlet>
    </div>
  `,
  styles:[`
    .app_template{ padding-bottom:30px;}
  `]
})
export class TemplateComponent{
}
