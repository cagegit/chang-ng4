/**
 * Created by fengjj on 2016/9/19.
 */
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Renderer,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { RegService } from "./reg.service";
import { Tenant } from "./Tenant.model";
//urls
import { URLS } from "./urls.config";
import { Error } from "../../common/model/Error";
import { AppNotification } from "../../app.notification";
import { SIZES } from "../../common/size-in-documnet";
import { ActivatedRoute, Router, NavigationEnd, Params } from "@angular/router";
@Component({
  selector: "reg-unexist",
  templateUrl: "./reg-unexist.component.html",
  styleUrls: ["./reg-unexist.component.css"]
})
export class RegUnexistComponent implements OnChanges, AfterViewInit {
  @Input()
  tenant: Tenant;
  @ViewChild("lookRight")
  lookRight: ElementRef;
  lookEmailUrl = "http://";
  repeatActiveEmailUrl = "";
  domain = "";
  isResendSuccess = false;
  height: number;
  isResend: any;

  constructor(
    private regService: RegService,
    private appNotification: AppNotification,
    private renderer: Renderer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["tenant"]) {
      this.repeatActiveEmailUrl =
        URLS.emailActiveUrl +
        "/" +
        changes["tenant"].currentValue.email +
        "/" +
        changes["tenant"].currentValue.uuid;
      //this.lookEmailUrl += "mail."+this.tenant.email.split('@')[1];
    }
  }

  ngAfterViewInit() {
    console.log(this.tenant);
    this.height =
      (document.body.clientHeight || document.documentElement.clientHeight) -
      SIZES.HEAD_HEIGHT -
      SIZES.FOOT_HEIGHT;
    this.renderer.setElementStyle(
      this.lookRight.nativeElement,
      "height",
      `${this.height}px`
    );
  }

  repeatSendMail() {
    console.log("repeat", this.tenant);
    this.regService
      // .sendMail(this.tenant.email, this.tenant.uuid, this.tenant.tenantID)
      .sendMail(this.tenant.email)
      .subscribe(d => {
        console.log("error", d);
        if (d.errCode == 200) {
          console.log(this.tenant.email);
          this.isResendSuccess = true;
          this.router.navigate(["/main/resend_success"], {
            queryParams: { email: this.tenant.email }
          });
          //this.appNotification.success('重新发送邮件成功')
        } else {
          this.appNotification.error("重新发送失败");
        }
      });
  }
}
