/**
 * Created by fengjj on 2016/9/19.
 */
import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {routing} from "./reg.routing";
import {RegService} from "./reg.service";
//import components
import {RegComponent} from "./reg.component";
import {RegUnexistComponent} from "./reg-unexist.component";
import {RegSetPasswordComponent} from "./reg-set-password.component";
import {RegInComponent} from "./reg-in.component";
import {RegSetDomainComponent} from "./reg-set-domain.component";
import {RegOkComponent} from "./reg-ok.component";
import {SharedModule} from "../../common/module/shared.module";
//full page
import {MnFullpageModule} from "ngx-fullpage";
import {InvalidComponent} from "./invalid.component";
import {ResendSuccessComponent} from "./resend-success.component";

@NgModule({
  imports:      [
    routing ,
    HttpModule ,
    SharedModule,
    MnFullpageModule
  ],
  declarations: [
    RegComponent,
    RegUnexistComponent,
    RegSetPasswordComponent ,
    RegInComponent,
    RegSetDomainComponent,
    RegOkComponent,
    InvalidComponent,
    ResendSuccessComponent],
  exports:      [],
  providers:    [ RegService ]
})
export class RegModule { }
