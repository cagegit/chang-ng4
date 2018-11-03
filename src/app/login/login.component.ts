import { Component, ViewChild, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { LoginForm } from "./login-form";
import { AuthService } from "../auth.service";
import { AppNotification } from "../app.notification";
import { DomainFactory } from "../common/DomainFactory";
import { User } from "../common/model/User";
import { CFG } from "../common/CFG";
import { DashboardService } from "../common/service/dashboard.service";
import { SIZES } from "../common/size-in-documnet";
@Component({
  templateUrl: "login.component.html",
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message: string;
  model: LoginForm = new LoginForm("", "", "");
  submitted = false;
  forgotPasswordFlag = false;
  loginForm: FormGroup;
  verifyEmail: string;
  email:string;
  //重置密码成功
  resetPwSuccess: string;
  minHeight: number;
  @ViewChild('resetPwSuccessModal') public resetPwSuccessModal: ModalDirective;

  domainName: string;


  constructor(private route: ActivatedRoute, public authService: AuthService, public router: Router, private formBuilder: FormBuilder, private appNotification: AppNotification, private dashboardService: DashboardService) {
    this.resetForm();
  }
  ngOnInit(): void {
    // console.log(this.route.params);
    this.route.queryParams.subscribe((params) => {
      let domainName = params['domainName'];
      console.log(domainName);
      if (domainName) {
        this.domainName = domainName;
      } else {
        this.domainName = window.location.host
      }
    });
    this.buildLoginForm();
    this.minHeight = (document.documentElement.clientHeight || document.body.clientHeight) - SIZES.HEAD_HEIGHT - SIZES.FOOT_HEIGHT;
  }


  buildLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      'userName': [this.model.userName, [
        Validators.required,
        Validators.minLength(4)
      ]],
      'userPw': [this.model.userPw]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(this.loginForm, data));
    this.onValueChanged(this.loginForm);
  }

  formErrors = {
    'userName': '',
    'userPw': ''
  };

  validationMessages = {
    'userName': {
      'required': '账户不能为空',
      'isEmail': '请输入有效的Email地址'
    },
    'userPw': {
      'required': '密码不能为空'
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

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          console.warn("错误消息:", messages[key]);
          this.formErrors[field] = messages[key];
        }
      }
    }
  }



  submit() {
    console.log('login submit');
    this.submitted = true;
    this.authService.login(this.domainName, this.loginForm.value.userName, this.loginForm.value.userPw).toPromise().then((response: any) => {
      console.log("登陆成功返回:", response.json());
      console.log(this.domainName);
      response.json().data.domainName = this.domainName;
      let userDTO = response.json().data;
      console.log(userDTO);
      console.log("userDTO:", userDTO);
      this.authService.loginSuccess(User.buildFromUserDTO(userDTO));
      // this.router.navigate(['/dashboard']);
      // this.dashboardService.getDashboardLatest().subscribe((dashboardID: string) => {
      //   if (dashboardID) {
      //     this.router.navigate([`/dashboard/${dashboardID}`]);
      //   } else {
      //     this.router.navigate(['/dashboard/list']);
      //   }
      // }, (error: Error) => {
      //   this.appNotification.error(error.errMsg);
      //   this.router.navigate(['/dashboard/list']);
      // });
    }).catch((response: any) => {
      // console.log(response.json());
      this.message = DomainFactory.buildError(response.json()).errorMsg;
      console.log(this.message);
      this.appNotification.error(this.message);
    })
    this.submitted = false;
  }

  resetForm() {
    this.message = "";
    //开发环境,设置默认用户名密码
    console.warn("初始化账号密码:", CFG.DEV.ENV);
    if (CFG.DEV.ENV == CFG.DEV_OPS.DEV) {
      console.warn("初始化账号密码:", CFG.DEV.DEBUG_USER);
      this.model = Object.assign(this.model, CFG.DEV.DEBUG_USER);
      console.warn("初始化账号密码:", this.model);
    }
  }

  get mailServer(): string {
    let mailServer = '';
    try {
      mailServer = 'http://mail.' + this.loginForm.value.userName.split("@")[1];
    } catch (e) {
      console.warn("邮箱错误:", e);
      mailServer = 'javascript:void(0)';
    }
    return mailServer;
  }

  resetPw() {
    this.forgotPasswordFlag = true;
    //console.info("忘记密码: validate=",!this.formErrors['userName']);
    //if(!this.formErrors['userName']){
    //  console.info('重置密码',this.loginForm.value.userName);
    //  this.authService.resetPw(this.loginForm.value.userName).subscribe(()=>{
    //    this.resetPwSuccessModal.show();
    //  },(response : Response)=>{
    //    let message=DomainFactory.buildError(response.json()).errMsg;
    //    this.appNotification.error(message);
    //  });
    //}else{
    //  console.warn("请输入正确的用户名");
    //  this.appNotification.error("请输入正确的用户名");
    //}
  }

  onSubmit() {
    console.log(this.model.userName);
    this.authService.resetPw(this.model.userName).subscribe(() => {
      console.log('success reset');
      this.resetPwSuccessModal.show();
    }, (response: Response) => {
      let message = DomainFactory.buildError(response.json()).errorMsg;
      this.appNotification.error(message);
    });
  }
  onCloseModal() {
    this.resetPwSuccessModal.hide();
    this.forgotPasswordFlag = false;
  }
  resetMessage() {
    this.message = "";
  }
  close() {
    this.router.navigateByUrl('/main')
  }

}
