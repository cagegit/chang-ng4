/**
 * Created by fengjj on 2016/12/5.
 */
  import { Renderer } from '@angular/core'
import {SIZES} from "../size-in-documnet";
class ComputeMinHeight {
  constructor() {
  }
  computeHeight() {
    let winHei = document.documentElement.scrollHeight || document.body.scrollHeight;
    return winHei - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT;
  }
  setMinHeight(renderer:Renderer,ele:any,b:boolean = false){
    if(!b){
      renderer.setElementStyle(ele,'min-height',`${this.computeHeight()}px`);
    }else {
      renderer.setElementStyle(ele,'height',`${this.computeHeight()}px`);
    }
  }
}
let computeMinHeight =  new ComputeMinHeight();
export {computeMinHeight}

