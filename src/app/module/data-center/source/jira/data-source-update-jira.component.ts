import {Component, OnInit ,trigger ,state ,style ,transition , animate } from "@angular/core";
import {Params, Router, ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../../auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AppNotification} from "../../../../app.notification";
import {Response} from "@angular/http";
import {DatabaseDataSource} from "../../../../common/model/database-data-source.model";
import {DataSourceService} from "../../../../common/service/data-source.service";

@Component({
  templateUrl:'./data-source-update-jira.component.html',
  styleUrls:['../../data-center.component.scss'],
  animations: [
    trigger('foldState', [
      state('inactive', style({
        height:'inherit'
      })),
      state('active',   style({
        height:'54px'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ]),
    trigger('iconState', [
      state('inactive', style({
        transform:'rotateX(180deg)'
      })),
      state('active',   style({
        transform:'rotateX(0deg)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class DataSourceUpdateJiraComponent implements OnInit{
  submitted = false;
  dataSourceForm: FormGroup;
  dataSource : DatabaseDataSource=new DatabaseDataSource();
  foldState = {
    sourceName:'inactive',
    connectConfig:'inactive',
    dataSync:'inactive',
    jiraData:'inactive'
  }
  iconState = {
    sourceName:'inactive',
    connectConfig:'inactive',
    dataSync:'inactive',
    jiraData:'inactive'
  }
  constructor(public authService:AuthService, private route:ActivatedRoute, public router:Router, private formBuilder:FormBuilder, private appNotification:AppNotification,private dataSourceService : DataSourceService) {
  }



  ngOnInit() {
    let id='';
    this.route.params.forEach((params:Params) => {
      id = params['id']; // (+) converts string 'id' to a number
      console.log("id:",id);
      if(id){
        //TODO 调用Service,初始化数据源
        this.dataSourceService.getById(id).subscribe((dataSource : DatabaseDataSource)=>{
          console.info("返回结果:",dataSource);
          this.dataSource=dataSource;
          this.buildForm();
        },(response : Response)=>{
          this.appNotification.error("数据源获取异常:资源不存在!");
        });
      }

    });
    this.buildForm();

  }

  buildForm(): void {
    this.dataSourceForm = this.formBuilder.group({
      'dataSourceID' : [this.dataSource.dataSourceID],
      'dataSourceName': [this.dataSource.dataSourceName, [
        Validators.required
      ]],
      'hostname': [this.dataSource.hostname,[
        Validators.required
      ]],
      'databaseName': [this.dataSource.databaseName,[
        Validators.required
      ]],
      'userName': [this.dataSource.username,[
        Validators.required
      ]],
      'password': [this.dataSource.password,[
        Validators.required
      ]],
      'databasePort': [this.dataSource.databasePort,[
        Validators.required
      ]],
    });
    console.log("buildForm:",this.dataSourceForm);
    this.dataSourceForm.valueChanges
      .subscribe(data => this.onValueChanged(this.dataSourceForm,data));
    this.onValueChanged(this.dataSourceForm);
  }

  formErrors = {
    'dataSourceName':'',
    'hostName': '',
    'dataBaseName': ''
  };

  validationMessages = {
    'dataSourceName' : {
      'required': '数据源名称不能为空'
    },
    'hostname': {
      'required':  '数据库地址不能为空'
    },
    'userName': {
      'required': '数据库账户名不能为空'
    }
  };
  onValueChanged(form : FormGroup,data?: any) {
    console.info("valueChange",data,'表单:',form);
    // if (!this.loginForm) { return; }
    // const form = this.loginForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          console.warn("错误消息:",messages[key]);
          this.formErrors[field] = messages[key];
        }
      }
    }
  }

  connectTest(){
    //TODO 提交表单,返回值数据源列表页

    this.submitted = true;
    this.dataSourceService.validateConnector(this.dataSourceForm.value).subscribe((dataSource : DatabaseDataSource)=>{
      this.appNotification.success("connection successful!");
    },(response : Response)=>{
      this.appNotification.success("connection failure!");
    });
    this.submitted = false;
  }

  formSubmit(){
    //TODO 提交表单,返回值数据源列表页

    this.submitted = true;
    this.dataSourceService.saveOrUpdate(this.dataSourceForm.value).subscribe((dataSource : DatabaseDataSource)=>{
      this.appNotification.success("添加数据源成功!");
      setTimeout(()=>{
        this.router.navigate(["/data_center/source/list"]);
      },1000);
    },(response : Response)=>{
      console.info("查询异常:获取异常,跳转至404页面");
    });
    this.submitted = false;
  }

  formReset(){
    this.buildForm();
  }
  changeFoldState(key:string) {
    this.foldState[key]= this.foldState[key] === 'active' ? 'inactive': 'active';
    this.iconState[key]= this.iconState[key] === 'active' ? 'inactive': 'active';
  }

}
