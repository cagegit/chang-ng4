/**
 * Created by fengjj on 2016/10/24.
 */
import { Directive, ElementRef, HostListener, Input, Renderer } from '@angular/core';

@Directive({
  selector: '[domMinHeight]'
})
export class DomMinHeightDirective {
  private currentEle:any;
  constructor(private el: ElementRef, private renderer: Renderer) { }

  @Input() set myFocusChangeStyle(className:string){
    if(className) {
      this.currentEle = this.findParentEleByClass(className) || this.el.nativeElement.parentNode;
    }else {
      this.currentEle = this.el.nativeElement.parentNode;
    }
  }


  @Input('focusClass') focusClass: string;

  @HostListener('focus') onFocus() {
    this.renderer.setElementClass(this.currentEle,this.focusClass,true);
  }
  @HostListener('blur') onBlur() {
    this.renderer.setElementClass(this.currentEle,this.focusClass,false);
  }
  private findParentEleByClass(className) {
    let parent = this.el.nativeElement.parentNode;
    if(parent) {
      let classStr = parent.className;
      if(classStr.indexOf(className) > -1){
        return parent;
      }else {
        this.findParentEleByClass(className);
      }
    }else {
      return null;
    }
  }
}
