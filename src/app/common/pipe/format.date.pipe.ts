/**
 * Created by fengjj on 2016/3/22.
 */
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({name: 'formatDate'})
export class FormatDate implements PipeTransform {
  transform(value:string, args:string[]) : string {
    let date='';
    let dateObj=new Date(Number(value));
    date=dateObj.getFullYear()+'-'+(this.backTwoNum(dateObj.getMonth()+1))+'-'+(this.backTwoNum(dateObj.getDate()))+' ';
    date+=this.backTwoNum(dateObj.getHours())+':'+this.backTwoNum(dateObj.getMinutes())+':'+this.backTwoNum(dateObj.getSeconds());
    return date;
  }
  backTwoNum(n:number):string {
    if(n<10) {
      return '0'+n;
    }else {
      return n.toString();
    }
  }
}
