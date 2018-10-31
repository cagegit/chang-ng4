import {
  Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter
} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";
import {DataSet} from "../../../common/model/data-set.model";
import {TableJoin} from "../../../common/model/table-join.model";
import {StarSchema} from "../../../common/model/star-schema.model";
import {DataSourceService} from "../../../common/service/data-source.service";
import {DataSourceTable} from "../../../common/model/data-source-table.model";
import {DataSourceTableField} from "../../../common/model/data-source-table-field.model";
import {AppNotification} from "../../../app.notification";
import {SchemaUtil} from "../../data-set/schema/schema-util";
import {Subject, Observable} from "rxjs/Rx";
@Component({
  selector:'relational-table',
  templateUrl: './relational-table.component.html',
  styleUrls: ['./relational-table.component.css']
})
export class RelationalTableComponent implements OnInit {
  @ViewChild('relationalTable') relationalTable:ModalDirective;
  //输入,输出参数
  @Input() dataSet : DataSet;
  @Input() defaultTable : string;
  @Output() relationChange = new EventEmitter<StarSchema[]>();
  fieldMap : Map<string,DataSourceTableField[]>=new Map<string,DataSourceTableField[]>();

  searchTermStream = new Subject<any>();
  filterSearch ={left : "",right : ""};
  fieldList={
    "left" : [],
    "right" : []
  };

  starSchema : StarSchema;
  currentTableJoin : TableJoin=new TableJoin();
  @Output() closeModal = new EventEmitter();



  get fieldListLeft() : DataSourceTableField[]{
    return this.fieldList.left.filter((field : DataSourceTableField)=>{
      return (this.filterSearch.left? new RegExp(this.filterSearch.left.toLowerCase()).test(field.fieldName.toLowerCase()) : true);
    });
  }

  get fieldListRight() : DataSourceTableField[]{
    return this.fieldList.right.filter((field : DataSourceTableField)=>{
      return (this.filterSearch.right? new RegExp(this.filterSearch.right.toLowerCase()).test(field.fieldName.toLowerCase()) : true);
    });
  }

  constructor(private dataSourceService : DataSourceService,private appNotification : AppNotification){
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((obj:{flag : string,keyword : string}) => {
        return Observable.of(obj);
      }).subscribe((obj:{flag : string,keyword : string}) => {
        this.filter(obj);
    });
  }

  ngOnInit() {
    if(!this.validInput()){
      console.error("relation 初始化selectedTables无效:",this.dataSet);
      return;
    }
    this.initDataSet();
    console.info("ngOnInit:",this.dataSet);
    this.initTable();
  }
  initDataSet(){
    console.log("clone",JSON.stringify(this.dataSet),this.dataSet);
    this.dataSet=this.dataSet.clone();
    this.dataSet.clearSelectedTablesDataSourceID();
    console.log("clone:after",JSON.stringify(this.dataSet));
    if(this.dataSet.starSchemas.length==0){
      console.log("初始化starSchemas:");
      this.dataSet.selectedTables.forEach((tableName : string)=>{
        this.dataSet.starSchemas.push(new StarSchema(tableName));
      });
    }
    this.dataSet.selectedTables.sort((x:string,y:string)=>{
      return x.localeCompare(y);
    });
  }



  initTable(){
    //初始化table字典[tableName,[field1,field2,field3]]
    console.log("this.dataSet.selectedTables:",this.dataSet.selectedTables);
    this.dataSet.selectedTables.map((tableName : string,index : number,array : string[])=>{
      this.dataSourceService.getTableInfo(this.dataSet.dataSourceID,tableName).subscribe((table : DataSourceTable)=>{
        let fields=new Array<DataSourceTableField>();
        table.tableFields.map((field : DataSourceTableField)=>{
          fields.push(new DataSourceTableField(field.fieldName,field.fieldType));
        })
        fields.sort((x:DataSourceTableField, y:DataSourceTableField)=> {
          return x.fieldName.localeCompare(y.fieldName);
        })
        this.fieldMap.set(table.tableName,fields);

        if(tableName==this.leftTableDefault){
          this.changeTable("left",tableName);
        }
        if(tableName==this.otherTableDefault(this.leftTableDefault)){
          this.changeTable("right",tableName);
        }
      })
    })


  }

  /**
   * 默认坐表
   * @returns {string}
     */
  get leftTableDefault() : string{
    return this.defaultTable?this.defaultTable:this.dataSet.selectedTables[0];
  }



  otherTableDefault(exceptTableName : string) : string{
    return this.dataSet.selectedTables.find((tableName : string)=>{
      return tableName!=exceptTableName;
    });
  }



  /**
   * 验证输入参数 有效返回true
   * @returns {DataSet|Array<string>}
     */
  validInput():boolean{
    // return this.dataSet!=undefined&&this.dataSet.selectedTables.length>0&&this.dataSet.dataSourceID!="";
    return true;
  }

  get options():string[]{
    return this.dataSet.selectedTables;
  }

  show(){
    this.relationalTable.show();
  }

  ngAfterViewInit() {
    this.relationalTable.show();
  }
  closeHandle() {
    this.relationalTable.hide();
    this.closeModal.next();
  }

  changeTable(flag : string, tableName : string){
    console.log("changeTable");
    this.fieldList[flag]=this.fieldMap.get(tableName);
    this.currentTableJoin[flag+'Table']=tableName;
    //默认选中第一项
    this.changeField(flag,this.fieldMap.get(tableName)[0].fieldName);

    if(flag=="left"){
      this.starSchema=this.dataSet.starSchemas.find((starSchema : StarSchema)=>{
        return tableName==starSchema.factTable;
      });
    }
  }

  changeOtherTable(otherFlag : string,tableName : string){
    let otherTableName=this.otherTableDefault(tableName);
    this.changeTable(otherFlag,otherTableName);
  }


  changeField(flag : string,field : string){
    this.currentTableJoin[flag+'Field']=field;
    console.log("changeField",flag,field,this.currentTableJoin);
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
    this.filterSearch[obj.flag]=obj.keyword;
    //console.log("filterSearch:",this.filterSearch);
  }


  addRelation(){
    if(!this.validateRelation()){
      return;
    }

    let temp=new TableJoin();
    temp.leftTable=this.currentTableJoin.leftTable;
    temp.leftField=this.currentTableJoin.leftField;
    temp.rightTable=this.currentTableJoin.rightTable;
    temp.rightField=this.currentTableJoin.rightField;
    this.starSchema.allJoins.push(temp);
  }

  validateRelation() : boolean{
    if(this.starSchema.allJoins.find((tableJoin : TableJoin)=>{
        return this.currentTableJoin.match(tableJoin);
      })){
      this.appNotification.error("关联已存在,请勿重复添加!");
      return false;
    }
    return true;
  }


  deleteRelation(tableJoin : TableJoin){
    this.starSchema.allJoins=this.starSchema.allJoins.filter((temp:TableJoin)=> {
      return !tableJoin.match(temp);
    })
  }

  clearRelation(){
    this.starSchema.allJoins=new Array<TableJoin>()
  }


  saveRelation(){
    let newStarSchemas=SchemaUtil.cloneStarSchemaArr(this.dataSet.starSchemas);
    console.log("newStarSchemas:",newStarSchemas);
    this.relationChange.emit(newStarSchemas);
    this.closeHandle();
  }

  /**
   * 重新生成starSchemas
   * @returns {StarSchema[]}
     */
  private getStarSchemas() : StarSchema[]{
    console.log("重新生成映射关系:init=",this.starSchema.allJoins.values());
    let map=new Map<string,Array<TableJoin>>();
    for(let tableJoin of this.starSchema.allJoins){
      if(!map.has(tableJoin.leftTable)){
          map.set(tableJoin.leftTable,[tableJoin]);
      }else{
          let arr=map.get(tableJoin.leftTable) as Array<TableJoin>;
          arr.push(tableJoin);
          map.set(tableJoin.leftTable,arr);
      }
    }
    let starSchemas=new Array<StarSchema>();
    map.forEach(function(value, key) {
      starSchemas.push(new StarSchema(key,value));
    })
    console.log("重新生成映射关系:result=",starSchemas);
    return starSchemas;
  }

}
