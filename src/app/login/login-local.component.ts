import { Component, OnInit} from '@angular/core';
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { FormGroup,FormBuilder,Validators } from "@angular/forms";
import { LoginForm } from './login-form';

@Component({
  templateUrl: "./login-local.component.html",
  styleUrls: ['./login.component.css']
})
export class LoginLocalComponent implements OnInit{
  loginForm: FormGroup;
  domainName: string;
  model: LoginForm = new LoginForm("", "", "");
  message='';
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {

  }
  ngOnInit() {
    this.buildLoginForm();
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

  onValueChanged(form: FormGroup, data?: any) {
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
    console.log(this.loginForm.value.userName+','+this.loginForm.value.userPw);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded'
      })};

    const formData = new FormData();
    formData.append('username', this.loginForm.value.userName);
    formData.append('password', this.loginForm.value.userPw);
    const redirectUrl ='http://datasee.net/#/chang/car/tasks';
    const postUrl = "http://10.10.26.2:19010/inner_api/user/login?redirectUrl=" + redirectUrl;
    this.http.post(postUrl,formData,httpOptions).subscribe(res => {
        console.log(res);
    },err => {
      console.log(err);
    });
  }
  resetMessage() {
    this.message = "";
  }

}
