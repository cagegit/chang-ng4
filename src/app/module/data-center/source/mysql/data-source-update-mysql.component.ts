import {
  Component,
  OnInit,
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../../auth.service";
import {
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import { AppNotification } from "../../../../app.notification";
import { Response } from "@angular/http";
import { DatabaseDataSource } from "../../../../common/model/database-data-source.model";
import { DataSource } from "../../../../common/model/data-source.model";
// import { NGValidators } from "ng-validators";
import { DataSourceService } from "../data-source.service";
@Component({
  templateUrl: "./data-source-update-mysql.component.html",
  styleUrls: ["../../data-center.component.scss"],
  animations: [
    trigger("foldState", [
      state(
        "inactive",
        style({
          height: "inherit"
        })
      ),
      state(
        "active",
        style({
          height: "54px"
        })
      ),
      transition("inactive => active", animate("100ms ease-in")),
      transition("active => inactive", animate("100ms ease-out"))
    ]),
    trigger("iconState", [
      state(
        "inactive",
        style({
          transform: "rotateX(180deg)"
        })
      ),
      state(
        "active",
        style({
          transform: "rotateX(0deg)"
        })
      ),
      transition("inactive => active", animate("100ms ease-in")),
      transition("active => inactive", animate("100ms ease-out"))
    ])
  ]
})
export class DataSourceUpdateMysqlComponent implements OnInit {
  submitted = false;
  disable = false;
  disables = false;
  dataSourceForm: FormGroup;
  dataSource: DatabaseDataSource = new DatabaseDataSource();
  foldState = {
    sourceName: "inactive",
    connectConfig: "inactive"
  };
  iconState = {
    sourceName: "inactive",
    connectConfig: "inactive"
  };

  DATA_SOURCE_PORT_MAP: Map<string, number> = new Map([
    [DataSource.TYPE.MYSQL, 3306],
    [DataSource.TYPE.KYLIN, 7070],
    [DataSource.TYPE.Hive2, 10000],
    [DataSource.TYPE.SPARK, 10000],
    [DataSource.TYPE.IMPALA, 21050]
  ]);

  DATA_SOURCE_TYPE_MAP : Map<string,string> = new Map([
    [DataSource.TYPE.MYSQL, "最流行的开源关系型数据库"],
    [DataSource.TYPE.KYLIN, "Apache Kylin™ 开源的分布式分析引擎"],
    [DataSource.TYPE.Hive2, "Apache Hive ™ 基于Hadoop的数据仓库工具"],
    [DataSource.TYPE.SPARK, "Apache Spark ™  快速的通用型大数据处理引擎"],
    [DataSource.TYPE.CODE, "CSDN 面向国内开发者提供代码托管平台"],
    [DataSource.TYPE.ISOURCE, "CSDN 企业版代码托管平台"],
    [DataSource.TYPE.IMPALA, "大数据时代快速SQL引擎"]
  ]);

  private regex = new RegExp(
    "[`~!@#$^%&*()=|{}':',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘：”“'。，、？《》\\s]"
  );
  private space = /(^\s+)|(\s+$)/;
  get defaultPort(): number {
    return this.DATA_SOURCE_PORT_MAP.get(this.dataSource.dataSourceType);
  }

  get dataSourceTypeDesc(): string {
    return this.DATA_SOURCE_TYPE_MAP.get(this.dataSource.dataSourceType);
  }

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private appNotification: AppNotification,
    private dataSourceService: DataSourceService
  ) {}

  ngOnInit() {
    let pathArr = window.location.href.split("/");
    let index =
      pathArr.findIndex((path: string) => {
        return path == "update";
      }) + 1;
    let dataSourceType = pathArr[index];
    // console.log(window.location);
    this.dataSource.dataSourceType = dataSourceType;
    this.route.params.subscribe(params => {
      let id = params["id"];
      if (id) {
        this.disable = true;
        this.dataSourceService.getById(id).subscribe(
          response => {
            // console.info("返回结果:", response);
            this.dataSource = response.data;
            // console.log(this.dataSource);
            this.buildForm();
          },
          (response: Response) => {
            this.appNotification.error("数据源获取异常:资源不存在!");
          }
        );
      }else{
        this.disable = false;
      }
    });
    this.buildForm();
  }
  validateTimer: any;
  buildForm(): void {
    // console.info("初始化表单:", this.dataSource);
    // let pathArr = window.location.hash.split("/");
    // let index =
    //   pathArr.findIndex((path: string) => {
    //     return path == "update";
    //   }) + 1;
    // let dataSourceType = 'mysql';
    // console.warn("dataSourceType:", dataSourceType);
    this.dataSourceForm = this.formBuilder.group({
      // 'dataSourceID' : [this.dataSource.dataSourceID],
      dataSourceType: [this.dataSource.dataSourceType],
      name: [this.dataSource.name, [Validators.required]],
      hostname: [
        this.dataSource.hostname || "",
        [Validators.required,
          // NGValidators.isURL()
        ]
      ],
      databaseName: [this.dataSource.databaseName, [Validators.required]],
      username: this.dataSource.dataSourceType==='mysql'?[this.dataSource.username, [Validators.required]]:[this.dataSource.username],
      password: this.dataSource.dataSourceType==='mysql'?[this.dataSource.password, [Validators.required]]:[this.dataSource.password],
      databasePort: [
        this.dataSource.databasePort || String(this.defaultPort),
        [Validators.required,
          // NGValidators.isNumeric()
        ]
      ]
      // 'type': [this.dataSource.type]
    });
    // console.log("buildForm:", this.dataSourceForm);
    this.dataSourceForm.valueChanges.subscribe(data =>
      this.onValueChanged(this.dataSourceForm, data)
    );
    this.onValueChanged(this.dataSourceForm);
  }

  formErrors = {
    name: "",
    hostname: "",
    databaseName: "",
    username: "",
    password: "",
    databasePort: ""
  };

  validationMessages = {
    name: {
      required: "数据源名称不能为空",
      duplicate: "数据源名称已存在或有特殊字符,请更换其它数据源名称"
    },
    hostname: {
      required: "数据库地址不能为空",
      isURL: "请输入合法的数据库地址"
    },
    databaseName: {
      required: "数据库名称不能为空"
    },
    username: {
      required: "数据库用户名不能为空"
    },
    password: {
      required: "数据库密码不能为空"
    },
    databasePort: {
      required: "端口号不能为空",
      isNumeric: "端口号必须为数字类型"
    }
  };
  onValueChanged(form: FormGroup, data?: any) {
    for (const field in this.formErrors) {
      this.formErrors[field] = "";
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          // console.warn("错误消息:", messages[key]);
          this.formErrors[field] = messages[key];
        }
      }
    }
  }

  asyncValidator(newName) {
    // newName = newName.trim();
    this.disables = false;
    // console.log("orgName=", this.dataSource.name, "new=", newName);
    if (!newName || newName == this.dataSource.name) {
      return;
    }
    // console.log("start validate", newName);
    // clearTimeout(this.validateTimer);
    // this.validateTimer = setTimeout(() => {
      if (!this.dataSourceForm.value) {
        return;
      }else if(newName && this.regex.test(newName) && this.space.test(newName)){
        this.formErrors["name"] = this.validationMessages["name"].duplicate;
        this.disables = true;
      }else if(newName){
        this.dataSourceService.validateDataSourceName(newName).subscribe(
          () => {
            this.formErrors["name"] = "";
            this.disables = false;
          },
          error => {
            this.disables = true;
            this.formErrors["name"] = this.validationMessages["name"].duplicate;
          }
        );
      }
    // }, 500);
  }

  connectTest() {
    //TODO 提交表单,返回值数据源列表页
    this.submitted = true;
    this.dataSourceService
      .validateConnector(this.dataSourceForm.value)
      .subscribe(
        (dataSource) => {
          this.appNotification.success("连接测试成功!");
        },
        (error) => {
          this.appNotification.error(error.error.errorMsg);
        }
      );
    this.submitted = false;
  }

  formSubmit() {
    //TODO 提交表单,返回值数据源列表页

    this.dataSourceForm.value.databasePort =
      this.dataSourceForm.value.databasePort || this.defaultPort;
    this.submitted = true;
    if(this.dataSource && this.dataSource.id){
      this.dataSourceForm.value.id = this.dataSource.id;
      this.dataSourceService.updateSourceItem(this.dataSourceForm.value).subscribe(
        (dataSource) => {
          this.appNotification.success("更新数据源成功!");
          setTimeout(() => {
            this.router.navigate(["/chang/data-center/list/set/source"]);
          }, 1000);
        },
        (error) => {
          this.appNotification.error(error.error.errorMsg);
        }
      );
      this.submitted = false;
    }else{
      this.dataSourceService.addSourceItem(this.dataSourceForm.value).subscribe(
        (dataSource) => {
          this.appNotification.success("添加数据源成功!");
          setTimeout(() => {
            this.router.navigate(["/chang/data-center/list/set/source"]);
          }, 1000);
        },
        (error) => {
          this.appNotification.error(error.error.errorMsg);
        }
      );
      this.submitted = false;
    }
  }

  formReset() {
    this.router.navigate(["/chang/data-center/list/set/source"]);
  }

  changeFoldState(key: string) {
    this.foldState[key] =
      this.foldState[key] === "active" ? "inactive" : "active";
    this.iconState[key] =
      this.iconState[key] === "active" ? "inactive" : "active";
  }
}
