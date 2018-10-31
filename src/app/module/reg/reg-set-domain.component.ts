/**
 * Created by fengjj on 2016/9/19.
 */
import {
  Component,
  OnInit,
  Renderer,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { RegService } from "./reg.service";
import { Tenant } from "./Tenant.model";
import { SIZES } from "../../common/size-in-documnet";
import {CFG} from "../../common/CFG";

@Component({
  templateUrl: "./reg-set-domain.component.html",
  styleUrls: ["./reg-set-domain.component.css"]
})
export class RegSetDomainComponent implements OnInit, AfterViewInit {
  @ViewChild("domainRight")
  domainRight: ElementRef;
  email = "";
  domainName: string;
  canSubmit = false;
  errMessage: string;
  isExist = false;
  isNotExist = false;
  tenant: Tenant;
  private reg = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,18}[a-zA-Z0-9]$/;

  constructor(
    private regService: RegService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer
  ) {}

  ngOnInit() {
    console.log(this.route.params);
    this.route.params.forEach((params: Params) => {
      let id = params["id"];
      this.email = id;
    });
  }

  ngAfterViewInit() {
    let winH =
      document.body.clientHeight || document.documentElement.clientHeight;
    this.renderer.setElementStyle(
      this.domainRight.nativeElement,
      "height",
      winH - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT + "px"
    );
  }

  public tooltipStateChanged(state: boolean): void {}

  onSubmit() {
    // console.log(this.tenant);s
    // console.log(CFG.API.TENANT);
    //现存问题：接口请求成功后 在跳转页面  this.isNotExist = true; 失败后提示信息
    this.regService
      .regAccount(this.email, this.domainName)
      .subscribe((d: any) => {
        // console.log(d);
        if (d.status && d.status === 409) {
          //租戶存在
          this.isExist = true;
        } else {
          console.log(d);
          //註冊成功
          this.tenant = d.data;
          console.log(this.tenant);
          this.isNotExist = true;
        }
      });
  }

  onChangeValue(val: string) {
    this.domainName = val;
    if (this.reg.test(val)) {
      this.canSubmit = true;
      this.errMessage = null;
    } else {
      this.canSubmit = false;
      this.errMessage = "格式错误！";
    }
  }
}
