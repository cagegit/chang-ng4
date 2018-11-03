import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { CFG } from "../common/CFG";
import { ModalDirective } from "ngx-bootstrap";

@Component({
  templateUrl: "login-domain.component.html",
  styleUrls: ['./login-domain.component.css']
})
export class LoginDomainComponent implements OnInit {
  message: string;
  submitted = false;

  modelDomain: string;
  loginDomainForm: FormGroup;
  @ViewChild('loginDomain') loginDomain: ModalDirective;

  constructor(public authService: AuthService, public router: Router, private formBuilder: FormBuilder) {
    //TODO : 测试数据,待删除
    this.modelDomain = (CFG.DEV.ENV == CFG.DEV_OPS.DEV ? CFG.DEV.DEBUG_USER.userDomain : '');
  }
  ngOnInit(): void {
    this.buildLoginDomainForm();
    //this.loginDomain.show();
  }

  buildLoginDomainForm(): void {
    console.log('change');
    this.loginDomainForm = this.formBuilder.group({
      'domainName': [this.modelDomain, [
        Validators.required
      ]]
    });
    this.loginDomainForm.valueChanges
      .subscribe(data => this.onValueChanged(this.loginDomainForm, data));
    this.onValueChanged(this.loginDomainForm);
  }

  formErrors = {
    'domainName': '',
  };

  validationMessages = {
    'domainName': {
      'required': '域名不能为空',
      'isURL': '请输入有效的URL地址'
    }
  };
  onValueChanged(form: FormGroup, data?: any) {
    // console.info("valueChange",data,'登录表单:',this.loginForm,'域名验证表单:',this.loginDomainForm);
    // if (!this.loginForm) { return; }
    // const form = this.loginForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      //domainName
      if (control && control.dirty && !control.valid) {
        console.log(control);
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          console.warn("错误消息:", messages[key]);
          this.formErrors[field] = messages[key];
        }
      }
    }
  }



  resetMessage() {
    this.message = "";
  }

  public domainValidate(): void {
    this.submitted = true;
    console.log(window.location.protocol);
    console.log(CFG.HTML_CFG);
    // this.authService.domainValidate(this.loginDomainForm.value.domainName).toPromise().then((response: any) => {
    //   console.info("域名验证成功:", response);
    //   //window.location.href=`${this.modelDomain}/#/login`; 
    //   this.router.navigate(["/login", { domainName: this.loginDomainForm.value.domainName }])
    //   // let jsessionid=response.json().error.data;
    //   // console.info("jsessionid",jsessionid);
    //   // this.authService.saveDomain(jsessionid);
    //   // this.loginDomainModal.hide();
    //   // this.loginModal.show();
    // }).catch((response: any) => {
    //   this.message = DomainFactory.buildError(response.json()).errMsg;
    //   console.info("验证")
    //   this.appNotification.error("该域名不存在")
    // })
    this.router.navigate(["/login"], {queryParams:{domainName: this.loginDomainForm.value.domainName }});
    this.submitted = false;
  }

  close() {
    this.router.navigateByUrl('/main')
  }
}
