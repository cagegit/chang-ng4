/**
 * Created by houxh on 2017-3-7.
 */
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({name: 'htmlParse'})
export class HtmlParse implements PipeTransform{
  transform(value:any, args?:any):any {
    return value.replace(/\n/g,'<br>');
  }

}
