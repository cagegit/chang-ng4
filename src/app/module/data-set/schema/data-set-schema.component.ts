import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChanges,
  OnChanges,
  trigger,
  state,
  style,
  transition,
  animate,
  ViewEncapsulation
} from "@angular/core";
import { StarSchema } from "../../../common/model/star-schema.model";
import { DataSet } from "../../../common/model/data-set.model";
import { DataSourceService } from "../../../common/service/data-source.service";
// import { DataSetService } from "../../../common/service/data-set.service";
import { AppNotification } from "../../../app.notification";
import { DataSourceTable } from "../../../common/model/data-source-table.model";
import { DataSourceTableField } from "../../../common/model/data-source-table-field.model";
import { Subject, Observable } from "rxjs/Rx";
import { TableJoin } from "../../../common/model/table-join.model";
import { Measure } from "../../../common/model/measure.model";
import { Dimension } from "../../../common/model/dimension.model";
import { Error } from "../../../common/model/Error";
import { SchemaUtil } from "./schema-util";
import { Hierachy } from "../../../common/model/hierachy.model";
import { Level } from "../../../common/model/level.model";
import { DragulaService } from "ng2-dragula/ng2-dragula";
import { Translate } from "./translate.model";
import { DataCardService } from "../data-card.service";
import { Page } from "../../../common/model/dashboard.model";
import { DataSetService } from "../../data-center/set/data-set.service";
import { takeWhile } from "rxjs/operators";
import { stringify } from "querystring";

export class HierachyEditor {
  tableName: string;
  hierachy: Hierachy = new Hierachy();
  hierachyOld: Hierachy;
}
export class Editor<T> {
  previousValue: T;
  currentValue: T;
  constructor(previousValue?: T, currentValue?: T) {
    this.previousValue = previousValue;
    this.currentValue = currentValue;
  }
}
export class LevelEditor extends Editor<Level> {
  fromHierachyEditor: boolean;
  hierachy: Hierachy;
  tableName: string;
  constructor(
    fromHierachyEditor: boolean,
    tableName: string,
    hierachy: Hierachy,
    previousValue: Level,
    currentValue: Level
  ) {
    super(previousValue, currentValue);
    this.fromHierachyEditor = fromHierachyEditor;
    this.tableName = tableName;
    this.hierachy = hierachy;
  }
}

/**
 * 维度列表对象,解决angular 对象检查问题
 */
export class DimensionTableArray {
  filter: string;
  dimensionTables: DataSourceTable[];
  constructor(dimensionTables: DataSourceTable[] = []) {
    this.dimensionTables = dimensionTables;
  }
  clear() {
    this.dimensionTables.length = 0;
  }
  add(dimensionTable: DataSourceTable) {
    this.dimensionTables.push(dimensionTable);
  }

  modify(dimensionTable: DataSourceTable) {
    this.dimensionTables = this.dimensionTables.map((old: DataSourceTable) => {
      if (old.equals(dimensionTable)) {
        old = dimensionTable;
      }
      return old;
    });
  }
}

@Component({
  selector: "data-set-schema",
  templateUrl: "./data-set-schema.component.html",
  styleUrls: ["./data-set-schema.component.css"],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger("groupFoldLeft", [
      state("inactive", style({ "padding-right": "0px" })),
      state("active", style({ "padding-right": "230px" })),
      transition("inactive => active", animate("500ms ease-in")),
      transition("active => inactive", animate("500ms ease-out"))
    ]),
    trigger("groupFoldRight", [
      state("active", style({ right: "-1px" })),
      state("inactive", style({ right: "-231px" })),
      transition("inactive => active", animate("500ms ease-in")),
      transition("active => inactive", animate("500ms ease-out"))
    ])
  ]
})
export class DataSetSchemaComponent
  implements OnInit, OnChanges {
  @Input()
  dataSet;
  @Input()
  schameLayerFlag: boolean;
  @Output()
  schemaChange = new EventEmitter<StarSchema[]>();
  private groupFoldFlag = "inactive";
  dimensionLayerFlag = false;
  factLayerPosition = { top: 0, left: 0 };
  dimensionLayerPosition = { top: 0, left: 0 };
  relationalTableFlag = false;

  currentSelectedTable: string;
  currentSelected: string;
  fieldMap: Map<string, any> = new Map<string, any>();

  //搜索过滤条件
  filterSearch = { fact: "", dimension: "" };
  searchTermStream = new Subject<any>();

  hierachyEditor: HierachyEditor;
  measureEditor: Measure;
  measureTempEditor: any;
  levelEditor: LevelEditor;
  // selectedTables = new Set();
  selectedTables = [];
  index = 0;
  //事实表
  private _factTable: Array<any>;
  private _dimensionTableArray: Array<any>;
  /**
   * 动态获取事实表(fieldMap/filter/currentSelectedTable 均为动态异步数据)
   * @returns {DataSourceTable}
   */

  get measureList() {
    // console.log(1);
    if (this.starSchema) {
      return this.starSchema.allMeasures;
    }
    // return [];
  }

  set measureList(measureList) {
    if (this.starSchema) {
      // console.log(this.starSchema);
      let newStarSchema = JSON.parse(JSON.stringify(this.starSchema));
      newStarSchema.allMeasures = measureList;
      let starSchemaList = this.dataSet.starSchemas.map(oldStarSchema => {
        if (oldStarSchema.factTable == newStarSchema.factTable) {
          oldStarSchema = newStarSchema;
        }
        return oldStarSchema;
      });
      // console.log("修改measureList:", this.starSchema.allMeasures, measureList);
      this.starSchemas = starSchemaList;
    }
  }

  get dimensionList() {
    if (this.starSchema) {
      return this.starSchema.allDimensions.sort((x, y) => {
        return x.tableName.localeCompare(y.tableName);
      });
    }
    return [];
  }

  set dimensionList(dimensionList) {
    // console.log("starSchema:", this.starSchema);
    if (this.starSchema) {
      let newStarSchema = JSON.parse(JSON.stringify(this.starSchema));
      newStarSchema.allDimensions = dimensionList;
      let starSchemaList = this.dataSet.starSchemas.map(oldStarSchema => {
        if (oldStarSchema.factTable == newStarSchema.factTable) {
          oldStarSchema = newStarSchema;
        }
        return oldStarSchema;
      });
      // console.log("修改starSchemas:", starSchemaList);
      this.starSchemas = starSchemaList;
    }
  }

  get starSchema() {
    // console.log("starSchema:org=",this.dataSet.starSchemas);
    if (this.dataSet.starSchemas && this.currentSelectedTable) {
      let factTableStarSchema = this.dataSet.starSchemas.filter(starSchema => {
        return this.currentSelectedTable.split(".")[1] == starSchema.factTable;
      });
      return factTableStarSchema.length > 0 ? factTableStarSchema[0] : null;
    }
  }

  /**
   * 直接修改当前的starSchema
   * @param starSchema
   */
  set starSchema(starSchema) {
    let starSchemaList = this.dataSet.starSchemas.map(oldStarSchema => {
      if (oldStarSchema.factTable == starSchema.factTable) {
        oldStarSchema = starSchema;
      }
      return oldStarSchema;
    });
    this.dataSet.starSchemas = starSchemaList;
  }

  /**
   * 更新全部星型模型
   */
  set starSchemas(starSchemas) {
    let param = Object.assign({}, this.dataSet, { starSchemas: starSchemas });
    console.log(
      "更新starSchemas: old=",
      this.dataSet.starSchemas,
      ",new:",
      param.starSchemas
    );
    this.dataSetService.updateSetItem(param).subscribe(
      dataSet => {
        this.dataSet = DataSet.build(dataSet);
        this.currentSelected = this.currentSelectedTable;
        this.schemaChange.emit();
      },
      error => {
        console.warn("出错啦!", error, this.appNotification);
        this.appNotification.error(error.errorMsg);
      }
    );
  }

  private bags = {
    field: "bag_field",
    measure: "bag_measure",
    dimension: "bag_dimension"
  };

  constructor(
    private dataSourceService: DataSourceService,
    private dataSetService: DataSetService,
    private appNotification: AppNotification,
    private dragulaService: DragulaService,
    private dataCardService: DataCardService
  ) {
    this.initDrag();
  }

  ngOnInit() {
    this.searchTermStream
      .debounceTime(500)
      .distinctUntilChanged()
      .switchMap((obj: { flag: string; keyword: string }) => {
        return Observable.of(obj);
      })
      .subscribe((obj: { flag: string; keyword: string }) => {
        this.filter(obj);
      });
  }


  ngOnChanges(changes: SimpleChanges) {
    this.index++;
    let simpleChange = changes["dataSet"];
    if (simpleChange && !simpleChange.isFirstChange()) {
      if (this.index == 2) {
        this.dataSet.selectedTables.map(tableName => {
          let name = tableName.split(".")[1];
          this.selectedTables.push([name, tableName]);
        });
      }
      if (this.currentSelected) {
        this.changeTable(this.currentSelected);
      } else {
        this.initPage();
      }
    }
  }

  //初始化页面数据
  initPage() {
    this.currentSelected = this.dataSet.selectedTables[0];
    this.dataSet.selectedTables.map(
      (tableName: string, index: number, array: string[]) => {
        if (index == 0) {
          this.changeTable(tableName);
        }
      }
    );
  }

  printMap(map: Map<string, DataSourceTableField[]>): any {
    let arr = [];
    map.forEach(function(value, key) {
      arr.push({ key: key, value: value });
    });
    return arr;
  }

  //指标
  get factTable() {
    let tableFields = this.fieldMap.get(this.currentSelectedTable);
    if (tableFields) {
      tableFields = tableFields.filter(field => {
        return (
          (this.filterSearch.fact
            ? new RegExp(this.filterSearch.fact.toLowerCase()).test(
                field.fieldName.toLowerCase()
              )
            : true) && field.sqlFieldType
        );
      });
      this._factTable = tableFields;
    }
    return this._factTable;
  }

  //维度
  get dimensionTableArray() {
    //添加筛选条件
    // this._dimensionTableArray.dimensionTables = this._dimensionTableArray.dimensionTables.map(
    //   (table: DataSourceTable) => {
    let tableFields = this.fieldMap.get(this.currentSelectedTable);
    if (tableFields && this.currentSelectedTable) {
      let name = this.currentSelectedTable.split(".")[1];
      tableFields = tableFields.filter(field => {
        return this.filterSearch.dimension
          ? new RegExp(this.filterSearch.dimension.toLowerCase()).test(
              field.fieldName.toLowerCase()
            )
          : true;
        // && field.schemaShowType
      });
      this._dimensionTableArray = [
        { tableName: name, tableFields: tableFields }
      ];
    }
    // }
    // );
    return this._dimensionTableArray;
  }

  changeTable(selectedTable) {
    let name = selectedTable.split(".")[1];
    let dataSourceID = selectedTable.split(".")[0];
    //获取维度 指标数据
    this.dataCardService
      .getTableInfo(dataSourceID, name, this.dataSet.isSQL)
      .subscribe(response => {
        let fields = new Array<any>();
        if (response && response.data) {
          response.data.tableFields.map(field => {
            fields.push(field);
          });
          this.fieldMap.set(this.currentSelectedTable, fields);
        }
        fields.sort((x, y) => {
          return x.fieldName.localeCompare(y.fieldName);
        });
      });
    this.currentSelectedTable = selectedTable;
    this.filterSearch = { fact: "", dimension: "" };
    let arr: DataSourceTable[] = [];
    // arr.push(
    //   new DataSourceTable(
    //     this.currentSelectedTable,
    //     this.fieldMap.get(this.currentSelectedTable)
    //   )
    // );

    //从星型模型中,提取与事实表相关的维度表,并设置相关属性
    // console.log("this.starSchema.allJoins:",JSON.stringify(this.starSchema));
    // if (this.starSchema && this.starSchema.allJoins) {
    //   this.starSchema.allJoins.map((tableJoin: TableJoin) => {
    //     console.warn(
    //       "第二张表:",
    //       tableJoin.rightTable,
    //       JSON.stringify(this.fieldMap.get(tableJoin.rightTable))
    //     );
    //     arr.push(
    //       new DataSourceTable(
    //         tableJoin.rightTable,
    //         this.fieldMap.get(tableJoin.rightTable)
    //       )
    //     );
    //   });
    // }
    // console.warn("当前表最新的表:", JSON.stringify(arr));
    // this._dimensionTableArray.dimensionTables = arr;
  }

  toggleFolder(parentNode, className) {
    // console.log("toggleFolder", arguments);
    if (this.hasClass(parentNode, className)) {
      this.removeClass(parentNode, className);
    } else {
      this.addClass(parentNode, className);
    }
  }

  /**
   * 搜索
   * @param item
   */
  search(flag: string, keyword: string) {
    let obj = { flag: flag, keyword: keyword };
    this.searchTermStream.next(obj);
  }
  filter(obj: { flag: string; keyword: string }) {
    this.filterSearch[obj.flag] = obj.keyword;
    //console.log("filterSearch:",this.filterSearch);
  }

  /**------------------------------------------------------------------------------------------------------------------指标操作开始**/
  /**
   * 删除指标
   * @param measure
   */
  delMeasure(measure: any): void {
    if (this.measureList.length == 1) {
      //点击最后一个指标时候,相当于点击清空操作
      this.delAllMeasure();
      return;
    }
    if (measure.constructor != Measure) {
      measure = new Measure(measure.factTable, measure.fieldName);
    }
    this.measureList = this.measureList.filter((temp: Measure) => {
      return !measure.equals(temp);
    });
  }

  updateMeasure(measureOld: Measure, measure: Measure) {
    let arr = SchemaUtil.cloneMeasureArr(this.measureList);
    arr = arr.map((temp: Measure) => {
      if (temp.equals(measureOld)) {
        return measure;
      }
      return temp;
    });
    this.measureList = arr;
    this.measureEditor = null;
  }

  measureChange(measure: Measure) {
    // console.log("measureChange:", this.measureTempEditor, measure);
    if (measure) {
      this.updateMeasure(this.measureTempEditor, measure);
    } else {
      this.measureEditor = null;
    }
  }

  sortMeasure(
    measure: Measure,
    oldIndex: number,
    insertMeasure: Measure
  ): void {
    console.log("argument:", arguments);
    let arr = SchemaUtil.cloneMeasureArr(this.measureList);
    arr.splice(oldIndex, 1);
    console.log("删除old:", JSON.stringify(arr));

    let newInsertNum = insertMeasure
      ? arr.findIndex((temp: Measure) => {
          return insertMeasure.equals(temp);
        })
      : this.measureList.length - 1;
    console.log("新插入位置:", newInsertNum);

    arr.splice(newInsertNum, 0, measure);
    console.log("新数组:", arr);
    console.log("旧数组:", this.measureList);
    // this.measureList = arr;
  }

  /**
   * 清空指标,直接操纵当前页面数据,与服务端不通讯
   */
  delAllMeasure() {
    let newStarSchema = JSON.parse(JSON.stringify(this.starSchema));
    newStarSchema.allMeasures = [];
    let starSchemaList = this.dataSet.starSchemas.map(oldStarSchema => {
      if (oldStarSchema.factTable == newStarSchema.factTable) {
        oldStarSchema = newStarSchema;
      }
      return oldStarSchema;
    });
    this.starSchemas = starSchemaList;
  }

  /**
   * 添加全部指标
   */
  addAllMeasure() {
    let arr = [];
    this.measureList.forEach(element => {
      arr.push(element);
    });
    this.factTable.map(field => {
      let newMeasure = SchemaUtil.buildMeasure(
        this.currentSelectedTable.split(".")[1],
        field
      );
      if (
        !arr.find(measure => {
          return newMeasure.equals(measure);
        })
      ) {
        arr.push(newMeasure);
      }
    });
    console.log("addAllMeasure:", arr);
    this.measureList = arr;
  }

  //单一加指标
  addMeasure(measure, insert) {
    // console.log(this.measureList);
    // console.log(measure);
    measure.factTable = measure.factTable.split(".")[1];
    let arr = SchemaUtil.cloneMeasureArr(this.measureList);
    console.log(this.measureList);
    let startNum = insert ? insert : arr.length;
    console.info("startNum", startNum);
    if (
      !arr.find(temp => {
        return temp.equals(measure);
      })
    ) {
      arr.splice(startNum, 0, measure);
      this.measureList = arr;
    } else {
      this.appNotification.error("该指标已存在");
    }
  }

  /**
   * 恢复默认指标
   */
  resetAllMeasure() {
    console.info("恢复默认操作");
  }

  /**------------------------------------------------------------------------------------------------------------------指标操作结束**/

  /**------------------------------------------------------------------------------------------------------------------维度操作开始**/

  /**
   * 删除hierachy
   * @param measure
   */
  delHierachy(tableName, hierachy: Hierachy) {
    //查找指定维度对象
    let newDimension;
    console.log(this.dimensionList);
    console.log(hierachy);
    newDimension = JSON.parse(
      JSON.stringify(
        this.dimensionList.find(temp => {
          return temp.tableName == tableName;
        })
      )
    );
    console.log(this.dimensionList);
    console.log(newDimension);
    //删除指定节点
    newDimension.allHierachies = newDimension.allHierachies.filter(
      (temp: Hierachy) => {
        return hierachy.hierachyName !== temp.hierachyName;
      }
    );
    console.log("after:del: ", newDimension);
    //更新维度对象
    console.info("oldDiminsionList", JSON.stringify(this.dimensionList));
    let newDiminsionList = this.dimensionList.map(old => {
      if (old.tableName == newDimension.tableName) {
        old = newDimension;
      }
      return old;
    });
    if (SchemaUtil.getDimensionCount(newDiminsionList) == 0) {
      this.appNotification.error("请至少保留一个维度!");
      return;
    }
    console.info("newDiminsionList", JSON.stringify(newDiminsionList));
    this.dimensionList = newDiminsionList;
  }

  addHierachy(tableName: string, hierachy: Hierachy, insert: number): void {
    console.info("addHierachy:", tableName, hierachy, insert);
    //查找指定维度对象
    let newDimension = JSON.parse(
      JSON.stringify(
        this.dimensionList.find((temp: Dimension) => {
          return temp.tableName == tableName;
        })
      )
    );
    let startNum = insert ? insert : newDimension.allHierachies.length;
    console.log(
      "添加维度:",
      newDimension.allHierachies,
      "--------------",
      hierachy.hierachyName
    );
    if (
      !newDimension.allHierachies.find((temp: Hierachy) => {
        return temp.hierachyName == hierachy.hierachyName;
        // return temp.hierachyName==hierachy.hierachyName||temp.equals(hierachy);
      })
    ) {
      newDimension.allHierachies.splice(startNum, 0, hierachy);
    } else {
      this.appNotification.error("维度已存在");
      return;
    }
    let newDiminsionList = this.dimensionList.map((old: Dimension) => {
      if (old.tableName === newDimension.tableName) {
        old = newDimension;
      }
      return old;
    });
    this.dimensionList = newDiminsionList;
  }

  sortHierachy(
    tableName: string,
    hierachy: Hierachy,
    oldIndex: number,
    insertHierachy: Hierachy
  ): void {
    console.log("排序操作:", arguments);
    //排序操作
    let newDimension = this.dimensionList
      .find((temp: Dimension) => {
        return temp.tableName == tableName;
      })
      .clone();
    console.log("dimensions old:", JSON.stringify(newDimension.allHierachies));
    newDimension.allHierachies.splice(oldIndex, 1);
    console.log(
      "dimensions alter remove:",
      JSON.stringify(newDimension.allHierachies)
    );
    let newInsertNum = insertHierachy
      ? newDimension.allHierachies.findIndex((temp: Hierachy) => {
          return insertHierachy.equals(temp);
        })
      : newDimension.allHierachies.length;
    newDimension.allHierachies.splice(newInsertNum, 0, hierachy);
    console.log(
      "dimensions alter add:",
      JSON.stringify(newDimension.allHierachies)
    );
    let newDiminsionList = this.dimensionList.map((old: Dimension) => {
      if (old.tableName === newDimension.tableName) {
        old = newDimension;
      }
      return old;
    });
    this.dimensionList = newDiminsionList;
  }

  updateHierachy(tableName: string, hierachyOld: Hierachy, hierachy: Hierachy) {
    let newDimension = JSON.parse(
      JSON.stringify(
        this.dimensionList.find((temp: Dimension) => {
          return temp.tableName == tableName;
        })
      )
    );
    let index = newDimension.allHierachies.findIndex((temp: Hierachy) => {
      return temp.hierachyName == hierachy.hierachyName;
    });
    // if(index>0){
    //   console.error("相同名称的维度已存在");
    //   this.appNotification.error("相同名称的维度已存在");
    //   return;
    // }
    newDimension.allHierachies = newDimension.allHierachies.map(
      (temp: Hierachy) => {
        console.log(temp);
        console.log(hierachyOld);
        if (temp.hierachyName == hierachyOld.hierachyName) {
          return hierachy;
        }
        return temp;
      }
    );
    let newDiminsionList = this.dimensionList.map((old: Dimension) => {
      if (old.tableName === newDimension.tableName) {
        old = newDimension;
      }
      return old;
    });
    this.dimensionList = newDiminsionList;
  }

  /**
   * 清空维度
   */
  delAllHierachy() {
    let dimensionList = JSON.parse(JSON.stringify(this.dimensionList));
    dimensionList = dimensionList.map(temp => {
      temp.allHierachies.length = 0;
      return temp;
    });
    let newStarSchema = JSON.parse(JSON.stringify(this.starSchema));
    console.log(this.starSchema);
    newStarSchema.allDimensions = dimensionList;
    let starSchemaList = this.dataSet.starSchemas.map(oldStarSchema => {
      if (oldStarSchema.factTable == newStarSchema.factTable) {
        oldStarSchema = newStarSchema;
      }
      return oldStarSchema;
    });
    this.starSchemas = starSchemaList;
  }

  /**
   * 添加全部指标
   */
  addAllHierachy() {
    console.log("copy init:", this.dimensionList);
    let newDimensionList = SchemaUtil.cloneDimensionArr(this.dimensionList);
    console.log("copy:", newDimensionList);
    newDimensionList = newDimensionList.map((dimension: Dimension) => {
      let leftDimensionTable = this.dimensionTableArray.find(
        (table: DataSourceTable) => {
          return table.tableName == dimension.tableName;
        }
      );
      if (leftDimensionTable) {
        console.log("leftDimensionTable", leftDimensionTable);
        leftDimensionTable.tableFields.forEach(
          (field: DataSourceTableField) => {
            let newHierachy = SchemaUtil.buildHierachy(field);
            console.log("newHierachy", newHierachy);
            if (
              !dimension.allHierachies.find((hierachy: Hierachy) => {
                console.log("compare:old=", hierachy, ",new=", newHierachy);
                return newHierachy.equals(hierachy);
              })
            ) {
              console.log("push", newHierachy);
              dimension.allHierachies.push(newHierachy);
            }
          }
        );
        console.log("dimension.allHierachies", dimension.allHierachies);
      }
      return dimension;
    });
    console.log("addAllHierachy:", newDimensionList);
    this.dimensionList = newDimensionList;
  }

  /**
   * 恢复默认指标
   */
  resetAllHierachy() {
    console.info("恢复默认操作");
  }

  addLevel(level: Level, insert: number): void {
    console.log("添加level到editor", level, insert);
    let levels = SchemaUtil.cloneLevelArr(
      this.hierachyEditor.hierachy.allLevels
    );
    let startNum = insert ? insert : levels.length;
    if (
      !levels.find((temp: Level) => {
        return temp.equals(level);
      })
    ) {
      levels.splice(startNum, 0, level);
    } else {
      this.appNotification.error("维度已存在");
      return;
    }
    this.hierachyEditor.hierachy.allLevels = levels;
  }

  sortLevel(level: Level, oldIndex: number, insertLevel: Level): void {
    //排序操作
    let levels = SchemaUtil.cloneLevelArr(
      this.hierachyEditor.hierachy.allLevels
    );
    levels.splice(oldIndex, 1);
    let newInsertNum = insertLevel
      ? levels.findIndex((temp: Level) => {
          return insertLevel.equals(temp);
        })
      : levels.length;
    levels.splice(newInsertNum, 0, level);
    this.hierachyEditor.hierachy.allLevels = levels;
  }

  delLevel(level: Level) {
    this.hierachyEditor.hierachy.allLevels = this.hierachyEditor.hierachy.allLevels.filter(
      (temp: Level) => {
        return temp.levelName !== level.levelName;
      }
    );
  }

  levelChange(level: Level) {
    console.log("measureChange:", this.levelEditor.previousValue, level);
    if (level) {
      this.updateLevel(this.levelEditor.previousValue, level);
      this.levelEditor = null;
    } else {
      this.levelEditor = null;
    }
  }

  updateLevel(levelOld: Level, level: Level) {
    console.log("updateLevel", levelOld, level);
    if (this.levelEditor.fromHierachyEditor) {
      //编辑hierachy中的level
      // this.hierachyEditor.hierachy
      let newLevelArr = SchemaUtil.cloneLevelArr(
        this.hierachyEditor.hierachy.allLevels
      );
      newLevelArr = newLevelArr.map((temp: Level) => {
        if (temp.equals(levelOld)) {
          return level;
        }
        return temp;
      });
      this.hierachyEditor.hierachy.allLevels = newLevelArr;
    } else {
      let newHierachy = JSON.parse(JSON.stringify(this.levelEditor.hierachy));
      let newLevelArr = SchemaUtil.cloneLevelArr(newHierachy.allLevels);
      newLevelArr = newLevelArr.map((temp: Level) => {
        if (temp.levelName == levelOld.levelName) {
          return level;
        }
        return temp;
      });
      newHierachy.allLevels = newLevelArr;
      newHierachy.hierachyName = level.levelName;
      this.updateHierachy(
        this.levelEditor.tableName,
        this.levelEditor.hierachy,
        newHierachy
      );
    }
  }

  /**
   * 展示维度分组
   */
  showHierachy(hierachy?: Hierachy, tableName?: string) {
    console.log("showHierachy:", hierachy);
    let newHierachyEditor = new HierachyEditor();
    if (hierachy) {
      //编辑维度分组
      newHierachyEditor.hierachyOld = hierachy;
      newHierachyEditor.hierachy = JSON.parse(JSON.stringify(hierachy));
      newHierachyEditor.tableName = tableName;
      this.hierachyEditor = newHierachyEditor;
    }
    this.hierachyEditor = newHierachyEditor;
    this.groupFoldFlag = "active";
  }

  cancelShowHierachy() {
    this.hierachyEditor = null;
    this.groupFoldFlag = "inactive";
  }

  /**
   * 保存Hierachy
   * @param hierachy
   */
  saveHierachy() {
    if (!this.validateHierachy(this.hierachyEditor.hierachy)) {
      return;
    }
    if (!this.hierachyEditor.hierachyOld) {
      console.log("save Hierachy", JSON.stringify(this.hierachyEditor));
      this.addHierachy(
        this.hierachyEditor.tableName,
        this.hierachyEditor.hierachy,
        null
      );
    } else {
      //编辑Hierachy
      console.log("update Hierachy", JSON.stringify(this.hierachyEditor));
      this.updateHierachy(
        this.hierachyEditor.tableName,
        this.hierachyEditor.hierachyOld,
        this.hierachyEditor.hierachy
      );
    }
    this.cancelSaveHierachy();
  }

  validateHierachy(hierachy: Hierachy): boolean {
    if (!hierachy.hierachyName) {
      this.appNotification.error("名称不能为空");
      return false;
    }

    if (hierachy.allLevels.length == 0) {
      this.appNotification.error("请拖入维度");
      return false;
    }
    return true;
  }

  cancelSaveHierachy() {
    this.groupFoldFlag = "inactive";
  }

  /**------------------------------------------------------------------------------------------------------------------维度操作结束**/

  /**------------------------------------------------------------------------------------------------------------------拖拽操作开始**/
  /**
   * 初始化拖拽功能
   */
  initDrag() {
    let old = this.dragulaService.find("bag");
    if (old) {
      this.dragulaService.destroy("bag");
    }
    this.dragulaService.setOptions("bag", {
      revertOnSpill: true,
      copy: (e, fromContainer) => {
        if (this.hasClass(e, "dev-field")) {
          return true;
        }
        return false;
      },
      accepts: (e, toContainer, fromContainer, insert) => {
        let flag: boolean = false;
        switch (true) {
          case this.hasClass(toContainer, "dev-container-measure") &&
            (this.hasClass(fromContainer, "dev-container-measure") ||
              this.hasClass(fromContainer, "dev-container-fact")): {
            //目标为指标,来源为 指标可选字段或维度可选字段
            flag = true;
            break;
          }
          case this.hasClass(toContainer, "dev-container-hierachy") &&
            (this.hasClass(fromContainer, "dev-container-hierachy") ||
              this.hasClass(fromContainer, "dev-container-dimension")): {
            //目标为指标,来源为 指标可选字段或维度可选字段
            console.log(
              "level:",
              fromContainer.dataset.table,
              toContainer.dataset.table
            );
            let translate = Translate.buildTranslate(e.dataset.translate);
            if (
              toContainer.dataset.table &&
              fromContainer.dataset.table != toContainer.dataset.table
            ) {
              this.appNotification.error(
                "所选维度必须为同一表内:" + toContainer.dataset.table
              );
              flag = false;
            } else {
              flag = true;
            }
            break;
          }
          case this.hasClass(toContainer, "dev-container-level") &&
            (this.hasClass(fromContainer, "dev-container-level") ||
              this.hasClass(fromContainer, "dev-container-dimension") ||
              this.hasClass(fromContainer, "dev-container-hierachy")): {
            //目标为指标,来源为 指标可选字段或维度可选字段
            console.log(
              "level:",
              fromContainer.dataset.table,
              toContainer.dataset.table
            );

            let translate = Translate.buildTranslate(e.dataset.translate);
            if (
              toContainer.dataset.table &&
              fromContainer.dataset.table != toContainer.dataset.table
            ) {
              this.appNotification.error(
                "所选维度必须为同一表内:" + toContainer.dataset.table
              );
              flag = false;
            } else if (
              translate.type == Translate.DATA_TYPE.HIERACHY &&
              !translate.data.level
            ) {
              this.appNotification.error("请选择未分组的维度属性!");
              flag = false;
            } else {
              flag = true;
            }
            break;
          }
        }
        return flag;
      },
      moves: (e, container, handle) => {
        // console.log("move",e,!this.hasClass(e,"dev-disabled"))
        return !this.hasClass(e, "dev-disabled");
      }
    });

    this.dragulaService.drag.subscribe(value => {
      // console.log("drag: dev-cancel:", value);
      this.onDrag(value.slice(1));
    });
    this.dragulaService.drop.subscribe(value => {
      // console.log("drop: dev-cancel:", value);
      this.onDrop(value.slice(1));
    });
    this.dragulaService.over.subscribe(value => {
      // console.log("over: dev-cancel:", value);
      this.onOver(value.slice(1));
    });
    this.dragulaService.out.subscribe(value => {
      // console.log("out: dev-cancel:", value);
      this.onOut(value.slice(1));
    });
    this.dragulaService.cancel.subscribe(value => {
      let e = value.slice(1)[0];
      // console.log("cancel: dev-cancel:", value);
      this.addClass(e, "dev-cancel");
    });
    this.dragulaService.dragend.subscribe(value => {
      let e = value.slice(1)[0];
      // console.log("拖拽完成:", value, e.parentNode);
      if (e.parentNode && !this.hasClass(e, "dev-cancel")) {
        e.parentNode.removeChild(e);
      }
      if (this.hasClass(e, "dev-cancel")) {
        // console.log("del: dev-cancel:", value);
        this.removeClass(e, "dev-cancel");
      }
    });
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

  private onDrag(args) {
    let [e, el] = args;
    // this.removeClass(e, 'ex-moved');
  }

  private onDrop(args) {
    // console.log("args:",args);
    let [e, toContainer, fromContainer, insert] = args;
    // console.log("onDrop,param=",e,toContainer,fromContainer,insert);
    // console.log("是否为排序?",toContainer===fromContainer?"是":"否");
    let translate = Translate.buildTranslate(e.dataset.translate);
    let tempMeasure;
    switch (true) {
      case toContainer != fromContainer &&
        this.hasClass(fromContainer, "dev-container-field") &&
        this.hasClass(toContainer, "dev-container-measure"): {
        //添加指标
        // console.log(translate.data);
        tempMeasure = SchemaUtil.buildMeasure(
          this.currentSelectedTable,
          translate.data
        );
        let insertNum = insert ? insert.dataset.index : null;
        this.addMeasure(tempMeasure, insertNum);
        break;
      }
      case toContainer === fromContainer &&
        this.hasClass(toContainer, "dev-container-measure"): {
        //排序指标
        tempMeasure = translate.data;
        let measureIndex = e.dataset.index;
        let insertMeasure = insert
          ? Translate.buildTranslate(insert.dataset.translate).data
          : null;
        console.warn("insertMeasure:", insertMeasure);
        this.sortMeasure(tempMeasure, measureIndex, insertMeasure);
        break;
      }
      case toContainer !== fromContainer &&
        this.hasClass(toContainer, "dev-container-hierachy"): {
        //添加维度
        let tableName = toContainer.dataset.table;
        let tempHierachy = SchemaUtil.buildHierachy(translate.data);
        let insertNum = insert ? insert.dataset.index : null;
        this.addHierachy(tableName, tempHierachy, insertNum);
        break;
      }
      case toContainer === fromContainer &&
        this.hasClass(toContainer, "dev-container-hierachy"): {
        //添加维度
        let tableName = toContainer.dataset.table;
        let changeHierachy = translate.data;
        let insertHierachy = insert
          ? Translate.buildTranslate(insert.dataset.translate).data
          : null;
        let hierachyNumber = e.dataset.index;
        console.log(
          "changeHierachy",
          changeHierachy,
          "insertHierachy",
          insertHierachy
        );
        this.sortHierachy(
          tableName,
          changeHierachy,
          hierachyNumber,
          insertHierachy
        );
        break;
      }
      case toContainer !== fromContainer &&
        this.hasClass(toContainer, "dev-container-level"): {
        //添加二级分组
        console.log("创建/编辑 level");
        let fromTable = fromContainer.dataset.table;
        console.log("fromTable", fromTable);
        this.hierachyEditor.tableName = fromTable;
        let newLevel = translate.toLevel();
        let insertNum = insert ? insert.dataset.index : null;
        this.addLevel(newLevel, insertNum);
        break;
      }
      case toContainer === fromContainer &&
        this.hasClass(toContainer, "dev-container-level"): {
        let changeLevel = translate.data;
        let insertLevel =
          insert && insert.dataset.translate
            ? Translate.buildTranslate(insert.dataset.translate).data
            : null;
        let changeNumber = e.dataset.index;
        this.sortLevel(changeLevel, changeNumber, insertLevel);
        break;
      }
    }

    // let [e, el] = args;
    // this.addClass(e, 'ex-moved');
  }

  private onOver(args) {
    //当前节点,container,原来的container
    let [e, toContainer, fromContainer] = args;
    if (toContainer != fromContainer) {
      let toType = toContainer.dataset.container;
      let translate = Translate.buildTranslate(e.dataset.translate);
      console.log("parent:", e, e.parentNode);
      let newElement = translate.toElement(toType);
      e.innerHTML = newElement.innerHTML;
      e.className = newElement.className;
      console.log("translate:to:", toType, translate, e);
    }
    this.addClass(e, "drag_move");
  }

  private onOut(args) {
    let [e, el, container] = args;
    this.removeClass(e, "drag_move");
  }

  private obj2Element(obj: any): any {
    return null;
  }

  private Element2Obj(e: any): any {
    return null;
  }

  private getTranslate(type: string, data: any): string {
    return `{"type" : "${type}","data" : ${JSON.stringify(data)}}`;
  }

  /**------------------------------------------------------------------------------------------------------------------拖拽操作结束**/

  /**
   * 是否为事实表
   * @param tableName
   * @returns {boolean}
   */
  isFactTable(tableName: string) {
    return tableName == this.currentSelectedTable;
  }

  relationChange(starSchemas: StarSchema[]) {
    this.starSchemas = starSchemas;
    //this.dataSet.starSchemas=starSchemas;
  }

  /***
   * 显示关联关系弹出层
   */
  showRelationalTable() {
    // this.tempDataSet=this.dataSet.clone();
    // this.tempDataSet.selectedTables=this.selectedTables.selectedTables();
    // this.tempDataSet.dataSourceList=this.selectedTables.origList;
    // this.relationalTableFlag = true;
    //通过外部控制,实现每次打开都创建新的窗口,不保存窗口状态
    this.relationalTableFlag = true;
  }

  /***
   * 关闭关联关系弹出层
   */
  closeRelationalTable() {
    this.relationalTableFlag = false;
  }

  //编辑显示编辑框
  onShowLayer(
    e: any,
    { layerType, direction }: { layerType: string; direction: string },
    editor: any,
    hierachyInfo?: {
      fromHierachyEditor: boolean;
      tableName: string;
      hierachy: Hierachy;
    }
  ) {
    let liNode: HTMLLIElement = e.target.parentNode;
    let outerNode = document.getElementsByClassName("dataset_detail_box")[0];
    let liNodeInfo = liNode.getClientRects();
    let outerNodeInfo = outerNode.getClientRects();
    let left = liNodeInfo[0].left - outerNodeInfo[0].left;
    let top = liNodeInfo[0].top - outerNodeInfo[0].top + 35;
    console.log("show", e, layerType, direction, editor);
    if (layerType == "fact") {
      //指标
      // this.factLayerPosition.left = left;
      // this.factLayerPosition.top = top;
      this.factLayerPosition = {
        left: left,
        top: top
      };
      this.measureEditor = JSON.parse(JSON.stringify(editor));
      this.measureTempEditor = JSON.parse(JSON.stringify(editor));
    } else {
      //维度
      this.dimensionLayerFlag = true;
      let newLeft: number;
      if (direction == "right") {
        newLeft = left - 180;
      } else {
        newLeft = left;
      }
      this.dimensionLayerPosition = {
        left: newLeft,
        top: top
      };
      this.levelEditor = new LevelEditor(
        hierachyInfo.fromHierachyEditor,
        hierachyInfo.tableName,
        hierachyInfo.hierachy,
        JSON.parse(JSON.stringify(editor)),
        JSON.parse(JSON.stringify(editor))
      );
    }
  }
}
