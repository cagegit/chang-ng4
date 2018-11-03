/**
 * Created by fengjj on 2016/3/7.
 */
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({name:'interceptLength'})
export class InterceptlengthPipe implements PipeTransform {
    transform(value:string, ...args:number[]) : any {
        value=value.replace(/^\s+|\s+$/g,'');
        if(value.length>args[0]) {
            value=value.substring(0,args[0]-3)+'...';
        };
        return value;
    }
}
