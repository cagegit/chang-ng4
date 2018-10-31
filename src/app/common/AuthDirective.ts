import {Directive, Input, TemplateRef, ViewContainerRef} from "@angular/core";
import {AuthService} from "../auth.service";
import {AppContext} from "./AppContext";
@Directive({
  selector: '[auth]'
})
export class AuthDirective {

  constructor( private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef,private appContext : AppContext) {
    // renderer.setElementStyle(el.nativeElement, 'display', 'none');
  }


  @Input() set auth(permission: string) {
    let hasPermission=this.appContext.hasPermission(permission);
    console.log("auth check:",permission,hasPermission);
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }

  }
}
