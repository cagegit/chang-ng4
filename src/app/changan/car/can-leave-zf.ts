import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {CarZfComponent} from "./car-zf.component";
export class CanLeaveZf implements CanDeactivate<CarZfComponent>{
  canDeactivate(component: CarZfComponent,
                route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean>|boolean {
    if(!component.isFinding){
      return true;
    }
    return confirm('数据查询中，确认离开吗?');
  }

}
