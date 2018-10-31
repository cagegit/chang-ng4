import {Injectable} from "@angular/core";
import {DataSetComponent} from "./data-set.component";
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Rx";

@Injectable()
export class DataSetCanDeactivate implements CanDeactivate<DataSetComponent> {
  canDeactivate(
    component: DataSetComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    component.stopTimer();
    return true;
  }
}
