/**
 * Created by houxh on 2017-1-19.
 */
import {Component,Input} from "@angular/core";

@Component({
  template:`<div class="year_select self_clearfix">
            <span>default   =</span><select [attr.data-unique]="filter.uniqueName">
            <option>选项</option>
            </select></div>`
})
export class GlobalFilterComponent{
  @Input() uniqueName:string;
  
}
