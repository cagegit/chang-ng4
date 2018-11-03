import {
  Component,
  OnInit,
  trigger,
  state,
  style,
  transition,
  animate,
  ViewChild,
  Renderer,
  ElementRef
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppNotification } from "../../../app.notification";
import { ModalDirective } from "ngx-bootstrap";
import { DataSet } from "../../../common/model/data-set.model";
import { DataSource } from "../../../common/model/data-source.model";
import { ActivatedRoute, Router } from "@angular/router";
import { StarSchema } from "../../../common/model/star-schema.model";
import { DataSourceTable } from "../../../common/model/data-source-table.model";
import { Subject } from "rxjs/Subject";
import {
  Project
} from "../../../common/model/git-data-source.model";
import { DataSourceService } from "../source/data-source.service";
import { DataSetService } from "./data-set.service";
@Component({
  templateUrl: "./data-set-update.component.html",
  styleUrls: ["./data-set-update.component.css"],
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
export class DataSetUpdateComponent implements OnInit {
  @ViewChild("editorBox")
  editorBox: ElementRef;
  editor: any;
  _editorText: string;
  @ViewChild("successModal")
  successModal: ModalDirective;
  //默认按钮禁用
  disabled = false;
  //全部数据源列表
  dataSourceList: DataSource[] = [];
  checkedTables = {
    showList: [],
    origList: []
  };
  targetTables = {
    showList: [],
    origList: []
  };
  originTables = {
    showList: [],
    origList: []
  };
  checkedTablesList = []; //复制可选数据
  selectedTablesList = []; //复制已选数据
  selectedTables = {
    origList: [],
    showList: []
  };

  dataSet: DataSet = new DataSet();
  dataSetForm: FormGroup;

  //控制详情接口一次调用数据源选择函数
  count = 0;

  /**CODE 项目**/
  selectedProjects: Project[] = [];
  /**选表操作**/
  private _allTables: DataSourceTable[] = [];
  searchTermStream = new Subject<any>();
  filterSearch = { left: "", right: "" };
  filterSearchName: string;

  //自定义SQL相关
  tablePreViewData: any;
  // querySql:string;

  private modelUrl: string;
  private validatorSubject = new Subject<string>();
  private regex = new RegExp(
    "[`~!@#$^%&*()=|{}':',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘：”“'。，、？《》\\s]"
  );

  private space = /(^\s+)|(\s+$)/;

  set editorText(text: string) {
    this.editor.setValue(text);
  }

  get editorText(): string {
    console.log("get editorText", this.editor.getValue());
    return this.editor.getValue();
  }

  ngAfterViewInit() {
    if (this.editorBox) {
      // this.editor = ace.edit(this.editorBox.nativeElement);
      // this.editor.setTheme("ace/theme/iplastic");
      // this.editor.getSession().setMode(`ace/mode/sql`);
      // this.editor.setReadOnly(false);
      // this.editor.setShowPrintMargin(false);
    }
  }

  foldState = {
    basicInfo: "inactive",
    selectSource: "inactive",
    dataAdd: "inactive",
    dataSync: "inactive"
  };
  iconState = {
    basicInfo: "inactive",
    selectSource: "inactive",
    dataAdd: "inactive",
    dataSync: "inactive"
  };

  showDataFlag = false;
  relationalTableFlag = false;
  formErrors = {
    dataSetName: "",
    isSQL: "",
    sqlString: ""
  };

  validationMessages = {
    dataSetName: {
      required: "数据集名称不能为空",
      duplicate: "数据集名称已存在或有特殊字符,请更换其它数据集名称"
    },
    isSQL: [],
    sqlString: []
  };
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private appNotification: AppNotification,
    private dataSourceService: DataSourceService,
    private dataSetService: DataSetService,
    private render: Renderer
  ) {}

  ngOnInit() {
    console.log("ngOnInit");
    this.dataSet.isSQL = false;
    this.route.params.subscribe(params => {
      console.log("初始化", params);
      let id = params["id"]; //数据集id 编辑数据集
      let dataSourceID = params["dataSourceID"]; //数据源id 数据源下新增数据集
      // this.initDataSourceList(id, dataSourceID);
      //数据集信息  更新数据集
      if (id) {
        this.dataSetService.getById(id).subscribe(
          response => {
            this.dataSet = response.data;
            this.dataSourceService.getSourceList().subscribe(
              response => {
                this.dataSourceList = response.data;
                this.dataSourceList.map(temp => {
                  this.dataSet.dataSourceList.map(item => {
                    if (temp.id === item.dataSourceID) {
                      this.toggleSelectedStatus(temp, "default");
                    }
                  });
                });
                this.bulidForm();
              },
              error => {
                this.appNotification.error(error.error.errorMsg);
              }
            );
          },
          response => {
            this.appNotification.error("数据源获取异常:资源不存在!");
          }
        );
      } else {
        //新增数据集
        //获取数据源列表 用于数据源的选择
        this.dataSourceService.getSourceList().subscribe(
          response => {
            this.dataSourceList = response.data;
            //数据源页面 新增数据集时调用 dataSourceID
            // this.changeDataSource(
            //   dataSourceID ? dataSourceID : this.dataSourceList[0].id
            // );
            this.bulidForm();
          },
          error => {
            this.appNotification.error(error.error.errorMsg);
          }
        );
      }
    });
    this.bulidForm();
  }

  bulidForm(): void {
    let sqlString = this.dataSet.isSQL ? this.dataSet.selectedTables[0] : "";
    // console.log("初始化表单:", this.dataSet.dataSetName, this.dataSet.isSQL);
    this.dataSetForm = this.formBuilder.group({
      dataSetName: [this.dataSet.dataSetName, [Validators.required]],
      dataSourceList: [this.dataSet.dataSourceList],
      sqlString: [sqlString]
    });
    this.dataSetForm.valueChanges.subscribe(data => {
      this.onValueChanged(this.dataSetForm, data);
    });
    this.onValueChanged(this.dataSetForm);
  }
  onValueChanged(form: FormGroup, data?: any) {
    // console.log("form", form.value);
    for (const field in this.formErrors) {
      this.formErrors[field] = "";
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] = messages[key];
        }
      }
    }
  }

  //点击选择数据表 改变数据表选中状态
  toggleTable(table) {
    table.checked = !table.checked;
  }

  //可选已选相互切换数据
  moveProject(leftToRight: boolean, all: boolean = false) {
    //已选到可选
    if (!leftToRight && !all) {
      // console.log("已选到可选");
      this.targetTables = JSON.parse(JSON.stringify(this.selectedTables));
      this.originTables = JSON.parse(JSON.stringify(this.selectedTables));
      //选中加到可选
      this.targetTables.showList.map(item => {
        let table = item.tables.filter(list => {
          return list.checked;
        });
        item.tables = table;
      });
      this.targetTables.showList.map(item => {
        if (
          item.tables &&
          item.tables.length !== 0 &&
          this.targetTables.showList.length !==
            this.checkedTables.showList.length
        ) {
          this.checkedTables.showList.push(item);
        } else {
          this.checkedTables.showList.map(temp => {
            if (temp.id === item.id) {
              temp.tables = temp.tables.concat(item.tables);
            }
          });
        }
      });
      //未选中留在已选
      this.originTables.showList.map(item => {
        let table = item.tables.filter(list => {
          return !list.checked;
        });
        item.tables = table;
      });
      this.originTables.showList.map((item, index) => {
        if (item.tables && item.tables.length === 0) {
          this.originTables.showList.splice(index, 1);
        }
      });
      this.selectedTables = JSON.parse(JSON.stringify(this.originTables));
    } else if (leftToRight && !all) {
      // console.log("可选到已选");
      this.targetTables.showList = [];
      this.targetTables = JSON.parse(JSON.stringify(this.checkedTables));
      this.originTables = JSON.parse(JSON.stringify(this.checkedTables));
      // console.log(this.originTables);
      //选中加到已选
      this.targetTables.showList.map((item, index) => {
        // console.log(1111);
        let table = item.tables.filter(list => {
          return list.checked;
        });
        item.tables = table;
        if (item.tables && item.tables.length === 0) {
          this.targetTables.showList.splice(index, 1);
        }
        // this.selectedTables.showList.push(item);
      });
      // console.log(this.targetTables.showList);
      //未解决
      if (
        this.selectedTables.showList &&
        this.selectedTables.showList.length === 0
      ) {
        // console.log(this.targetTables.showList);
        this.selectedTables.showList = JSON.parse(
          JSON.stringify(this.targetTables.showList)
        );
      } else {
        // console.log(this.targetTables.showList);
        let selectArr = [];
        this.selectedTables.showList.forEach(element => {
          selectArr.push(element.id);
        });
        this.targetTables.showList.forEach(item => {
          if (selectArr.indexOf(item.id) > -1) {
            let index = selectArr.indexOf(item.id);
            // this.selectedTables.showList[index].tables.
            item.tables.forEach(element => {
              if (element.checked) {
                this.selectedTables.showList[index].tables.push(element);
              }
            });
          } else {
            let table = item.tables.filter(list => {
              return list.checked;
            });
            item.tables = table;
            this.selectedTables.showList.push(item);
          }
        });
      }
      //未选中留在可选
      this.originTables.showList.map((item, index) => {
        let table = item.tables.filter(list => {
          return !list.checked;
        });
        item.tables = table;
        if (item.tables && item.tables.length === 0) {
          this.originTables.showList.splice(index, 1);
        }
      });
      this.checkedTables = JSON.parse(JSON.stringify(this.originTables));
    } else if (leftToRight && all) {
      //all可选到已选
      this.selectedTables = JSON.parse(JSON.stringify(this.checkedTables));
      this.checkedTables.showList = [];
    } else if (!leftToRight && all) {
      //all已选到可选
      this.checkedTables = JSON.parse(JSON.stringify(this.selectedTables));
      this.selectedTables.showList = [];
    }
    //复制一份已选数据表数据
    this.selectedTablesList = [];
    this.selectedTables.origList = [];
    this.selectedTables.showList.map(item => {
      this.selectedTables.origList.push(item);
      item.tablesCopy = [];
      item.tables.map(list => {
        item.tablesCopy.push(list);
      });
      this.selectedTablesList.push(item);
    });
  }
  //数据集名称校验

  asyncValidator(name: string) {
    // name = name.trim();
    // console.log(this.space.test(name));
    if (name.length > 0) {
      if(!this.regex.test(name)&&!this.space.test(name)){
        this.dataSetService.validateDataName(name).subscribe(
          () => {
            this.formErrors["dataSetName"] = "";
            this.disabled = false; 
          },
          (err) => {
            this.formErrors[
              "dataSetName"
            ] = this.validationMessages.dataSetName.duplicate;
            this.disabled = true;
            // this.appNotification.error(err.error.errorMsg);
          }
        );
      }else{
        this.disabled = true;
        this.formErrors[
          "dataSetName"
        ] = this.validationMessages.dataSetName.duplicate;
        // this.appNotification.error('数据集名称不可输入特殊字符');
      }
    }
  }

  //展开合起
  changeFoldState(key: string) {
    this.foldState[key] =
      this.foldState[key] === "active" ? "inactive" : "active";
    this.iconState[key] =
      this.iconState[key] === "active" ? "inactive" : "active";
  }

  closeSuccessModal() {
    this.successModal.hide();
    this.router.navigate(["/data_center/set/list"]);
  }

  private tempDataSet: DataSet;
  /***
   * 显示关联关系弹出层
   */
  // showRelationalTable() {
  //   if (this.selectedTables.origList.length != 1) {
  //     this.appNotification.error("仅但数据源支持设置关联关系!");
  //     return;
  //   }

  //   if (this.selectedTables.selectedTables().length == 0) {
  //     this.appNotification.error("请先选择数据库表!");
  //     return;
  //   }

  //   if (this.selectedTables.selectedTables().length < 2) {
  //     this.appNotification.error("至少选择两张表");
  //     return;
  //   }
  //   this.tempDataSet = this.dataSet.clone();
  //   this.tempDataSet.selectedTables = this.selectedTables.selectedTables();
  //   this.tempDataSet.dataSourceList = this.selectedTables.origList;
  //   this.relationalTableFlag = true;
  // }
  /***
   * 关闭关联关系弹出层
   */
  closeRelationalTable() {
    this.relationalTableFlag = false;
  }

  relationChange(starSchemas: StarSchema[]) {
    this.dataSet.starSchemas = starSchemas;
  }

  //取消 返回数据集列表 页面
  formReset() {
    this.router.navigate(["/chang/data-center/list/set"]);
  }

  //提交数据
  onSubmit() {
    let param = Object.assign(this.dataSet, this.dataSetForm.value);
    // param.dataSetName = this.dataSetForm.value.dataSetName;
    param.dataSourceList = [];
    this.dataSourceList.map(item => {
      // console.log(item);
      let obj = {
        dataSourceType: "",
        dataSourceID: "",
        dataSourceName: ""
        // dataSetID: ""
      };
      if (item.checked) {
        obj.dataSourceID = item.id;
        obj.dataSourceName = item.name;
        obj.dataSourceType = item.dataSourceType;
        param.dataSourceList.push(obj);
      }
    });
    param.selectedTables = [];
    this.selectedTables.origList.map(item => {
      item.tables.map(list => {
        param.selectedTables.push(list.name);
      });
    });
    // console.log(param);
    if (param.selectedTables.length == 0) {
      this.appNotification.error("请选择数据库表!");
      return;
    }
    // console.log("表单提交:", this.dataSetForm.value);
    if (this.dataSet.dataSetID) {
      // console.log(this.dataSet);
      let data = {
        dataSetName: this.dataSetForm.value.dataSetName,
        dataSourceList: param.dataSourceList,
        selectedTables: param.selectedTables,
        dataSetID: this.dataSet.dataSetID,
        cardNum: this.dataSet.cardNum,
        createdBy: this.dataSet.createdBy,
        dataSourceType: this.dataSet.dataSourceType,
        updatedTime: this.dataSet.updatedTime
      };
      this.dataSetService.updateSetItem(data).subscribe(
        (d: any) => {
          this.router.navigate(["/chang/data-center/list/set"]);
          // if (this.dataSet.dataSetID) {
          //   // this.dataSet = DataSet.build(d);
          //   this.appNotification.success("编辑成功");
          //   this.router.navigate(["/chang/data-center/list/set"]);
          // } else {
          //   // this.dataSet = d;
          //   // this.dataSet = DataSet.build(d);
          //   this.modelUrl = `/data_set/${d.dataSetID}/model/update`;
          //   this.successModal.show();
          // }
        },
        error => {
          this.appNotification.error(error.error.errorMsg);
        }
      );
    } else {
      let data = {
        dataSetName: this.dataSetForm.value.dataSetName,
        dataSourceList: param.dataSourceList,
        selectedTables: param.selectedTables
      };
      this.dataSetService.saveSetItem(data).subscribe(
        (d: any) => {
          // console.log("保存成功:", d);
          this.router.navigate(["/chang/data-center/list/set"]);
          // if (this.dataSet.dataSetID) {
          //   // this.dataSet = DataSet.build(d);
          //   this.appNotification.success("编辑成功");
          //   this.router.navigate(["/chang/data-center/list/set"]);
          // } else {
          //   // this.dataSet = d;
          //   // this.dataSet = DataSet.build(d);
          //   this.modelUrl = `/data_set/${d.dataSetID}/model/update`;
          //   this.successModal.show();
          // }
        },
        error => {
          this.appNotification.error(error.error.errorMsg);
        }
      );
    }
  }

  //切换数据源选择
  toggleSelectedStatus(
    dataSource: DataSource,
    flag,
    element: any = { checked: false }
  ) {
    //TODO:锁定当前checkbox
    element.disabled = true;
    // console.log("element:", dataSource, element.checked == true);
    if (element.checked) {
      //选中数据源
      // console.log(1);
      if (dataSource.dataSourceType == DataSource.TYPE.SPARK) {
        // console.log("spark数据源");
        //当前选中的为spark数据源: 如果已选数据源.length>0 return false
        // if (this.checkedTables.origList.length > 0) {
        //   this.appNotification.error("spark数据源不支持多数据源关联!");
        //   element.checked = false;
        //   return;
        // }
      } else {
        // console.log("非spark数据源");
        //当前选中的非spark数据源: 如果已选数据源.length>0且包含spark. return
        // if (
        //   this.checkedTables.origList.findIndex((temp: DataSource) => {
        //     return temp.dataSourceType == DataSource.TYPE.SPARK;
        //   }) > -1
        // ) {
        //   this.appNotification.error("spark数据源不支持多数据源关联!");
        //   element.checked = false;
        //   return;
        // }
      }
    }
    element.disabled = true;
    if (!dataSource.checked) {
      //数据源本身是否
      // console.log(2);
      // console.log(dataSource);
      this.selectedTables.showList = [];
      this.dataSourceList.forEach(element => {
        if(element.id !== dataSource.id){
           element.checked = false;
        }
      });
      //选中数据源
      this.dataSetService.findAllTable(dataSource.id).subscribe(
        tables => {
          // console.log(tables);
          let allTables = tables.data.map(temp => {
            temp.tableName = `${temp.tableName}`;
            temp.name = `${dataSource.id}.${temp.tableName}`;
            return temp;
          });
          //更新时 已选数据表
          let newDataSource;
          newDataSource = JSON.parse(JSON.stringify(dataSource));
          newDataSource.tables = allTables;
          newDataSource.tablesCopy = allTables;
          // console.log(newDataSource);
          this.checkedTables.showList =  [];
          this.checkedTables.showList.push(newDataSource);
          // console.log(this.checkedTables.showList);
          if (
            this.dataSet.selectedTables &&
            this.dataSet.selectedTables.length !== 0 &&
            flag === "default"
          ) {
            // console.log(this.dataSet.selectedTables);
            // console.log("default");
            this.dataSet.selectedTables.map(tableName => {
              let dataSourceID = tableName.split(".")[0];
              let name = tableName.split(".")[1];
              this.checkedTables.showList.map(temp => {
                if (temp.id === dataSourceID) {
                  //tables 选择
                  temp.tables.map(list => {
                    if (list.tableName === name) {
                      list.checked = true;
                    }
                  });
                }
              });
            });
            // console.log(this.checkedTables);
            this.moveProject(true);
          }
          //复制原始数据
          this.checkedTablesList.push(newDataSource);
          //TODO:解锁
          dataSource.checked = !dataSource.checked;
          element.disabled = false;
        },
        error => {
          this.appNotification.error(error.error.errorMsg);
          this.checkedTables.showList =  [];
          //TODO:解锁
          element.disabled = false;
        }
      );
    } else {
      //取消数据源
      let arr = [];
      this.checkedTables.showList.forEach(item => {
        arr.push(item.id);
      });
      let index = arr.indexOf(dataSource.id);
      // console.log(index);
      this.checkedTables.showList.splice(index, 1);
      //TODO:解锁
      dataSource.checked = !dataSource.checked;
      element.disabled = false;
    }
  }

  //过滤可选数据表
  refreshCheckedTable() {
    // console.log("重新渲染数据","origList",this.origList);
    // console.log(this.checkedTablesList);
    return this.checkedTablesList.map(dataSource => {
      // console.log(dataSource);
      let tables = dataSource.tablesCopy.filter(table => {
        return this.filterSearchName
          ? new RegExp(this.filterSearchName.toLowerCase()).test(
              table.tableName.toLowerCase()
            )
          : true;
      });
      dataSource.tables = tables;
    });
  }

  //过滤可选数据表
  checkedTableSearch(keyword: string) {
    // console.log(keyword);
    if (keyword) {
      this.filterSearchName = keyword;
      this.refreshCheckedTable();
    } else {
      this.checkedTablesList.map(item => {
        item.tables = [];
        item.tables = [].concat(item.tablesCopy);
      });
    }
  }

  //过滤已选数据表
  refreshSelectedTable() {
    this.selectedTablesList;
    // console.log(this.selectedTablesList);
    return this.selectedTablesList.map(dataSource => {
      // console.log(dataSource);
      let tables = dataSource.tablesCopy.filter(table => {
        return this.filterSearchName
          ? new RegExp(this.filterSearchName.toLowerCase()).test(
              table.tableName.toLowerCase()
            )
          : true;
      });
      dataSource.tables = tables;
    });
  }

  //过滤已选数据表
  selectedTableSearch(keyword: string) {
    // console.log(keyword);
    // console.log(this.selectedTables);
    if (keyword) {
      this.filterSearchName = keyword;
      this.refreshSelectedTable();
    } else {
      this.selectedTablesList.map(item => {
        item.tables = [];
        item.tables = [].concat(item.tablesCopy);
      });
    }
  }

  showTableName(tableName: string) {
    return DataSet.tableName(tableName);
  }

  toggleFolder(parentNode: any, className: string) {
    if (this.hasClass(parentNode, className)) {
      this.removeClass(parentNode, className);
    } else {
      this.addClass(parentNode, className);
    }
  }

  private hasClass(el: any, name: string) {
    // return el.classList.contains(name);
    if (!el || !el.className) {
      return false;
    }
    if (el.className) {
      return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }
    return false;
  }

  private addClass(el: any, name: string) {
    if (!this.hasClass(el, name)) {
      el.classList.add(name);
      // el.className = el.className ? [el.className, name].join(' ') : name;
    }
  }

  private removeClass(el: any, name: string) {
    if (this.hasClass(el, name)) {
      el.classList.remove(name);
      // el.className = el.className.replace(new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)', 'g'), '');
    }
  }

  //选择数据源
  // changeDataSource(
  //   dataSourceID: string,
  //   dataSource?: DataSource,
  //   clearSelected?: boolean
  // ) {
  // this.dataSource=dataSource?dataSource:this.dataSourceList.find((temp : DataSource)=>{
  //   return temp.dataSourceID==dataSourceID;
  // });;
  // this.dataSet.dataSourceID=this.dataSource.dataSourceID;
  // this.dataSet.dataSourceType=this.dataSource.dataSourceType;
  // this.initProjects();
  // this.dataSourceService.findAllTable(this.dataSource.dataSourceID).subscribe((tables:DataSourceTable[]) => {
  //   this.allTables=tables.map((temp : DataSourceTable)=>{
  //     return DataSourceTable.build(temp);
  //   })
  //   console.log("initTables:",this.allTables);
  // },(error : Error)=>{
  //   if(error.errCode!=404){
  //     this.appNotification.error(error.errorMsg);
  //   }
  // });
  // if (clearSelected) {
  //   // this.selectedTables=[];
  //   // this.selectedTables.showList = [];
  // }
  // setTimeout(() => {
  //   this.ngAfterViewInit();
  // }, 0);
  // }

  //获取已选数据表
  // initProjects() {
  //   console.log(this.dataSet.dataSourceType);
  //   console.log(DataSource.TYPE.CODE); //code

  //   if (this.dataSet.dataSourceType == DataSource.TYPE.CODE) {
  //     console.log(1111);
  //     this.dataSourceService.getById(this.dataSet.dataSourceID).subscribe(
  //       (dataSource: GitDataSource) => {
  //         this.selectedProjects = dataSource.selectedProjects;
  //       },
  //       error => {
  //         if (error.errCode != 404) {
  //           this.appNotification.error(error.errorMsg);
  //         }
  //       }
  //     );
  //   }
  // }

  // initDataSourceList(dataSetID: string, dataSourceID: string) {

  //   this.dataSourceService.find().subscribe((dataSourceList: DataSource[]) => {
  //     this.dataSourceList = dataSourceList.map((dataSource: DataSource) => {
  //       return DataSource.build(dataSource);
  //     });
  //     let currentDataSourceList: DataSource[] = [];
  //     if (dataSourceID) {
  //       currentDataSourceList.push(this.dataSourceList.find((temp: DataSource) => {
  //         return temp.dataSourceID == dataSourceID;
  //       }));
  //     }
  //     if (dataSetID) {

  //       currentDataSourceList = this.dataSet.dataSourceList.filter(() => { return true });

  //       this.dataSetService.getById(dataSetID).subscribe((dataSet: DataSet) => {
  //         this.dataSet = DataSet.build(dataSet);
  //         let arr: DataSourceTable[] = [];
  //         this.dataSet.selectedTables.forEach((tableName: string) => {
  //           let tempDataSourceTable = new DataSourceTable(tableName);
  //           tempDataSourceTable.checked = true;
  //           this.dataSet.dataSourceList = this.dataSet.dataSourceList.map((tmp: DataSource) => {
  //             if (tmp.dataSourceID == tempDataSourceTable.dataSourceID) {
  //               tmp.tables.push(tempDataSourceTable);
  //             }
  //             this.selectedTables.addDataSourceAndTables([tmp]);
  //             return tmp;
  //           });
  //         })
  //         //勾选当前已关联的数据源
  //         this.dataSourceList = this.dataSourceList.map((dataSource: DataSource) => {
  //           console.log("全部数据源:", JSON.stringify(this.dataSourceList), "选中:", JSON.stringify(this.dataSet.dataSourceList));
  //           if (this.dataSet.dataSourceList.find((temp: DataSource) => {
  //             console.log("temp.dataSourceID:", temp.dataSourceID, "dataSource.dataSourceID:", dataSource.dataSourceID)
  //             return temp.dataSourceID == dataSource.dataSourceID;
  //           })) {
  //             // dataSource.checked=true;
  //             this.toggleSelectedStatus(dataSource)
  //           } else {
  //             dataSource.checked = false;
  //           }
  //           console.log("勾选:", dataSource.dataSourceName, dataSource.checked);
  //           return dataSource;
  //         })
  //         this.bulidForm();
  //       }, (response: Response) => {
  //         this.appNotification.error("数据源获取异常:资源不存在!");
  //       });
  //     }

  //   }, (error) => {
  //     if (error.errCode != 404) {
  //       this.appNotification.error(error.errorMsg);
  //     }
  //   })
  // }

  /**
   * 打开数据预览
   * @param id
   */
  showDataHandle(e: MouseEvent, tableName: string) {
    //e.defaultPrevented = true;
    this.tablePreViewData = null;
    if (tableName) {
      // this.dataSetService.getPreViewDataByTableName(this.dataSet.dataSourceID, tableName).subscribe((d) => {
      //   this.tablePreViewData = d;
      //   this.showDataFlag = true;
      // })
    } else {
      // this.dataSetService.getPreViewDataBySql(this.dataSet.dataSourceID, this.editorText).subscribe((d) => {
      //   this.tablePreViewData = d;
      //   this.showDataFlag = true;
      // })
    }
    return false;
  }

  /***
   * 关闭数据预览
   */
  closeDataShow() {
    this.showDataFlag = false;
  }
}
