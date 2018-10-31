import {Component, OnInit ,trigger ,state ,style ,transition , animate } from "@angular/core";
import {Params, Router, ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../../auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AppNotification} from "../../../../app.notification";
import {Response} from "@angular/http";
import {DataSourceService} from "../../../../common/service/data-source.service";
import {GitDataSource, Project} from "../../../../common/model/git-data-source.model";
import {Subject, Observable} from "rxjs/Rx";
import {Error} from "../../../../common/model/Error"
import { NGValidators } from 'ng-validators';
import {DataSource} from "../../../../common/model/data-source.model";
import {Pagination} from "../../../../common/model/pagination.model";
@Component({
  templateUrl:'./data-source-update-code.component.html',
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
export class DataSourceUpdateCodeComponent implements OnInit{
  submitted = false;
  dataSourceForm: FormGroup;
  dataSource : GitDataSource=new GitDataSource();
  private _allProjects : Project[]=[];
  private _selectedProjects : Project[]=[];
  allProjectCount : number=0;
  searchTermStream = new Subject<any>();
  filterSearch ={left : "",right : ""};
  dashboardID : string;
  foldState = {
    sourceName:'inactive',
    connectConfig:'inactive'
  }
  iconState = {
    sourceName:'inactive',
    connectConfig:'inactive'
  }
  pagination : Pagination=new Pagination(0,0,0);

  get allProjects():Project[]{
    return this._allProjects.filter((project : Project)=>{
      return (this.filterSearch.left? new RegExp(this.filterSearch.left.toLowerCase()).test(project.projectName.toLowerCase()) : true)&&(!Project.containsProject(this._selectedProjects,project));
    });
  }

  set allProjects(value:Project[]){
    this._allProjects=value;
  }

  get selectedProjects():Project[]{
    return this._selectedProjects.filter((project : Project)=>{
      return (this.filterSearch.right? new RegExp(this.filterSearch.right.toLowerCase()).test(project.projectName.toLowerCase()) : true);
    });
  }

  set selectedProjects(projects:Project[]){
    console.log("selectedProjects:",JSON.stringify(projects));
    Project.sortProject(projects);
    console.log("add4:",JSON.stringify(projects));
    this.dataSource.selectedProjects=projects;
    this._selectedProjects=projects;
  }

  toggleProject(project : Project){
    project.checked=!project.checked;
  }



  constructor(public authService:AuthService, private route:ActivatedRoute, public router:Router, private formBuilder:FormBuilder, private appNotification:AppNotification,private dataSourceService : DataSourceService) {
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((obj:{flag : string,keyword : string}) => {
        return Observable.of(obj);
      }).subscribe((obj:{flag : string,keyword : string}) => {
        this.filter(obj);
    });
  }



  ngOnInit() {
    let pathArr=window.location.hash.split('/');
    let index=pathArr.findIndex((path : string)=>{
        return path=="update";
      })+1;
    let dataSourceType=pathArr[index];

    if(dataSourceType.indexOf(";")>-1){
      dataSourceType=dataSourceType.substring(0,dataSourceType.indexOf(";"));
    }
    this.dataSource.dataSourceType=dataSourceType;
    this.route.params.subscribe((params) => {
      let id=params['id'];
      if(id){
        this.dataSourceService.getById(id).subscribe((dataSource : GitDataSource)=>{
          console.info("返回结果:",dataSource);
          this.dataSource=GitDataSource.build(dataSource);
          this._selectedProjects=this.dataSource.selectedProjects;
          this.buildForm();
          this.connectTest(false);
        },(response : Response)=>{
          this.appNotification.error("数据源获取异常:资源不存在!");
        });
      }
      let dashboardID=params["dashboardID"];
      if(dashboardID){
        this.dashboardID=dashboardID;
      }
    });
    this.buildForm();
  }
  validateTimer : any;
  buildForm(): void {
    console.info("初始化表单:",this.dataSource);
    let pathArr=window.location.hash.split('/');
    let index=pathArr.findIndex((path : string)=>{
        return path=="update";
      })+1;
    let dataSourceType=pathArr[index];
    if(dataSourceType.indexOf(";")>-1){
      dataSourceType=dataSourceType.substring(0,dataSourceType.indexOf(";"));
    }
    console.warn("dataSourceType:",dataSourceType);
    if(dataSourceType==DataSource.TYPE.ISOURCE){
      this.dataSource.connectedState=true;
      this.dataSourceForm = this.formBuilder.group({
        'dataSourceID' : [this.dataSource.dataSourceID],
        'dataSourceType' : [this.dataSource.dataSourceType],
        'dataSourceName': [this.dataSource.dataSourceName, [
          Validators.required
        ]],
        'type': [this.dataSource.type]
      });
      this.initAllProjects();
    }else{
      this.dataSource.connectedState=false;
      this.dataSourceForm = this.formBuilder.group({
        'dataSourceID' : [this.dataSource.dataSourceID],
        'dataSourceType' : [this.dataSource.dataSourceType],
        'dataSourceName': [this.dataSource.dataSourceName, [
          Validators.required
        ]],
        'gitHost': [this.dataSource.gitHost||"",[
          Validators.required,
          NGValidators.isURL({ protocols: ['http','https'],require_protocol: true})
        ]],
        'gitUsername': [this.dataSource.gitUsername,[
          Validators.required
        ]],
        'gitPassword': [this.dataSource.gitPassword,[
          Validators.required
        ]],
        'type': [this.dataSource.type]
      });
    }

    console.log("buildForm:",this.dataSourceForm);
    this.dataSourceForm.valueChanges
      .subscribe(data => this.onValueChanged(this.dataSourceForm,data));
    this.onValueChanged(this.dataSourceForm);
  }

  formErrors = {
    'dataSourceName':'',
    'gitHost': '',
    'gitUsername': '',
    'gitPassword': ''
  };

  validationMessages = {
    'dataSourceName' : {
      'required': '数据源名称不能为空',
      'duplicate' : '数据源名称已存在,请更换其它数据源名称'
    },
    'gitHost': {
      'required':  '服务器地址不能为空',
      'isURL' : '请输入合法的数据源地址,以http(s)://开头'
    },
    'gitUsername': {
      'required': '用户名不能为空'
    },
    'gitPassword': {
      'required': '密码不能为空'
    }
  };
  onValueChanged(form : FormGroup,data?: any) {
    // console.info("valueChange",data,'表单:',form);
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

  asyncValidator(newName){
    console.log("orgName=",this.dataSource.dataSourceName,"new=",newName);
    if(!newName||newName==this.dataSource.dataSourceName){
      return;
    }
    console.log("start validate");
    clearTimeout(this.validateTimer);
    this.validateTimer=setTimeout(()=>{
      if(!this.dataSourceForm.value){
        return;
      }
      this.dataSourceService.validateDataSourceName(this.dataSourceForm.value).subscribe(()=>{
        this.formErrors['dataSourceName'] = '';
      },(error : Error)=>{
        this.formErrors['dataSourceName'] = this.validationMessages['dataSourceName'].duplicate;
      });
    },500);
  }



  connectTest(successTips : boolean=true){
    //TODO 提交表单,返回值数据源列表页
    this.submitted = true;
    this.dataSourceService.validateConnector(this.dataSourceForm.value).subscribe((dataSource : GitDataSource)=>{
      if(successTips){
        this.appNotification.success("连接测试成功!");
      }
      this.dataSource.connectedState=true;
      this.initAllProjects();
    },(error : Error)=>{
      this.appNotification.error(error.errMsg);
    });
    this.submitted = false;
  }

  /**
   * 初始化全部项目列表
   */
  initAllProjects(){
    this.dataSourceService.findAllProject(this.dataSourceForm.value,this.pagination.gotoPage,this.filterSearch.left).subscribe((data : any)=>{
      this.allProjects=data.content;
      this.pagination=data.pagination;
    },(error : Error)=>{
      this.appNotification.error(error.errMsg);
    });
    this.submitted = false;
  }


  /**
   * 搜索
   * @param item
   */
  search(flag:string,keyword : string) {
    let obj={"flag":flag,"keyword" : keyword};
    this.searchTermStream.next(obj);
  }
  filter(obj : {flag : string,keyword : string}){
    console.log("filter:",obj);
    this.filterSearch[obj.flag]=obj.keyword;
    if(obj.flag=="left"){
      this.initAllProjects();
    }
  }

  moveProject(leftToRight:boolean,all : boolean=false){
    let fromProjects : Project[],toProjects : Project[];
    if(leftToRight){
      fromProjects=this.allProjects;
      toProjects=this._selectedProjects;
      if(all){
        toProjects=toProjects.concat(fromProjects);
      }else{
        let selected=fromProjects.filter((temp : Project)=>{
          return temp.checked;
        });
        selected.forEach((temp : Project)=>{
          let addProject=Project.findProject(toProjects,temp);
          if(addProject){
            addProject.checked=true;
          }else{
            toProjects.push(temp);
          }
        });
      }
      console.warn("selectedProjects:",toProjects);
      this.selectedProjects=toProjects;
    }else{
      fromProjects=this.selectedProjects;
      toProjects=this._allProjects;
      if(all){
        fromProjects=[];
      }else{
        let selected=fromProjects.filter((temp : Project)=>{
          return temp.checked;
        });
        selected.forEach((temp : Project)=>{
          let addProject=Project.findProject(toProjects,temp);
          if(addProject){
            addProject.checked=true;
          }
        });
        fromProjects=fromProjects.filter((temp : Project)=>{
          return !temp.checked;
        });
      }
      Project.clearChecked(fromProjects);
      this.selectedProjects=fromProjects;
    }

  }



  formSubmit(){
    //TODO 提交表单,返回值数据源列表页
    // this.dataSourceForm.value.databasePort=this.dataSourceForm.value.databasePort||3306;
    if(this.dataSource.allBranchFlag==GitDataSource.ALL_BRANCH_FLAG.ALL){
      this._selectedProjects.length=0;
    }else{
      if(this._selectedProjects.length==0){
        this.appNotification.error("请获取并选择指定的项目!");
        return  false;
      }
    }
    this.dataSourceForm.value.selectedProjects=this._selectedProjects;
    this.submitted = true;
    if(this.dashboardID){
      this.dataSourceService.saveWithDashboard(this.dataSourceForm.value,this.dashboardID).subscribe((dataSource : GitDataSource)=>{
        this.appNotification.success("创建数据源并替换dashboard成功!");
        setTimeout(()=>{
          this.router.navigate([`/dashboard/${this.dashboardID}`]);
        },1000);
      },(error : Error)=>{
        this.appNotification.error(error.errMsg);
      });
    }else{
      this.dataSourceService.saveOrUpdate(this.dataSourceForm.value).subscribe((dataSource : GitDataSource)=>{
        this.appNotification.success("添加数据源成功!");
        setTimeout(()=>{
          this.router.navigate(["/data_center/source/list"]);
        },1000);
      },(error : Error)=>{
        this.appNotification.error(error.errMsg);
      });
    }
    this.submitted = false;
  }

  formReset(){
    window.history.go(-1);
  }
  changeFoldState(key:string) {
    this.foldState[key]= this.foldState[key] === 'active' ? 'inactive': 'active';
    this.iconState[key]= this.iconState[key] === 'active' ? 'inactive': 'active';
  }

  private showBranchSelect : boolean=false;
  private currentSelectedProject : string;

  selectBranch(projectName : string){
    this.dataSource=Object.assign(this.dataSource,this.dataSourceForm.value);
    this.showBranchSelect=true;
    this.currentSelectedProject=projectName;
  }

  saveProject(project : Project){
    console.log("saveProject",project);
    this._selectedProjects=this._selectedProjects.map((temp : Project)=>{
        if(temp.equals(project)){
            return project;
        }else{
            return temp
        }
    });
  }

  closeSelectBranch(){
    this.showBranchSelect=false;
  }

  updateSelectType(value : number){
    this.dataSource.allBranchFlag=value;
  }

  pageChanged(event: any): void {
    this.pagination.gotoPage=event.page;
    this.initAllProjects();
  }

}
