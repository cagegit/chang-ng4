import {StarSchema} from "./star-schema.model";
import {BasePermissionModel} from "./base-permission-model";
import {SchemaHandle} from "./schema-handle.model";
import {DataSource} from "./data-source.model";
export class DataSet extends BasePermissionModel {
   dataSetID : string;
   dataSetName : string;
   createdTime : number;
   updatedTime : number;
   createdBy : string;
   createdById : number;
   numberOfCreatedReport : number;
   cardNum: number;
   isSQL : boolean;
   selectedTables : Array<string>=[];
   starSchemas : Array<StarSchema>=[];

  /**
   * 排序
   * @param values
   */
  static tableName(tableNameWithDataSource : string):string{
    return  tableNameWithDataSource.split(".")[1];
  }

  /**
   * 排序
   * @param values
   */
  static sortSelectedTables(values : string[]){
    values.sort((x:string,y:string) => {
      return x.localeCompare(y);
    })
  }


  set dataSourceID(value: string) {
    this._dataSourceID = value;
  }

  set dataSourceName(value: string) {
    this._dataSourceName = value;
  }

  set dataSourceType(value: string) {
    this._dataSourceType = value;
  }

  private _dataSourceID : string;
  private _dataSourceName : string;
  private _dataSourceType : string;

  dataSourceList : Array<DataSource>=[];

  /**
   * 有且仅有1个数据源时,快捷返回对应数据源信息,否则返回NULL
   * @returns {string}
   */
  get dataSourceID() : string{
    return this.dataSourceList.length==1?this.dataSourceList[0].dataSourceID:null;
  }
  get dataSourceName() : string{
    return this.dataSourceList.length==1?this.dataSourceList[0].dataSourceName:null;
  }
  get dataSourceType() : string{
    return this.dataSourceList.length==1?this.dataSourceList[0].dataSourceType:'sources';
  }


  /**模型预计算信息: schemaHandle!=null时,需要处理相应的状态信息**/
  schemaHandle : SchemaHandle;


  constructor(userList?:string, permissions?:string[],dataSetID?:string, dataSetName?:string, createdTime?:number, updatedTime?:number, createdBy?:string,createdById?:number, numberOfCreatedReport?:number, cardNum?:number, isSQL?:boolean, selectedTables?:string[], starSchemas?:StarSchema[],dataSourceList?:DataSource[],schemaHandle?:SchemaHandle) {
    super(userList, permissions);
      this.dataSetID = dataSetID;
      this.dataSetName = dataSetName;
      this.createdTime = createdTime;
      this.updatedTime = updatedTime;
      this.createdBy = createdBy;
      this.createdById = createdById;
      this.numberOfCreatedReport = numberOfCreatedReport;
      this.cardNum = cardNum;
      this.isSQL = isSQL;
      this.selectedTables = selectedTables?selectedTables:[];

      if(starSchemas){
        starSchemas.forEach((starSchema : StarSchema)=>{
          this.starSchemas.push(new StarSchema(starSchema.factTable,starSchema.allJoins,starSchema.allMeasures,starSchema.allDimensions));
        });
      }else{
        this.starSchemas=[];
      }
/*
      dataSourceList=[{
        dataSourceID : '6b6f9186-1549-4a6f-8043-ec1d4d7d4a74',
        dataSourceName : '研发数据_6',
        dataSourceType : 'mysql'
      },{
        dataSourceID : 'cca77a90-550e-470b-9db4-fcd0ef29b3d4',
        dataSourceName : 'isource',
        dataSourceType : 'isource'
      },{
        dataSourceID : '0946e1fe-255b-450c-b1e9-669f0e3c4f0b',
        dataSourceName : 'code',
        dataSourceType : 'code'
      }] as DataSource[];
*/


      if(dataSourceList){
        dataSourceList.forEach((dataSource : DataSource)=>{
          this.dataSourceList.push(new DataSource(null,null,dataSource.dataSourceID,dataSource.dataSourceName,dataSource.dataSourceType));
        });
      }else{
        this.dataSourceList=[];
      }



     /* schemaHandle={
      status : SchemaHandle.STATUS.READY,
      startTime : 1484150400000,
      endTime : 1484841600000,
      remainingTime : (8*60*60+30*60+5)*1000,
      completePercent : 50,
      modifyStatus : "NO"
    }as SchemaHandle;*/
      this.schemaHandle=schemaHandle?SchemaHandle.build(schemaHandle):null;
  }

  clone(){
    return new DataSet(this.userList,this.permissions,this.dataSetID,this.dataSetName,this.createdTime,this.updatedTime,this.createdBy,this.createdById,this.numberOfCreatedReport,this.cardNum,this.isSQL,this.selectedTables,this.starSchemas,this.dataSourceList,this.schemaHandle);
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
     */
  static build(simpleObj : DataSet) : DataSet{
    return new DataSet(simpleObj.userList,simpleObj.permissions,simpleObj.dataSetID,simpleObj.dataSetName,simpleObj.createdTime,simpleObj.updatedTime,simpleObj.createdBy,simpleObj.createdById,simpleObj.numberOfCreatedReport,simpleObj.cardNum,simpleObj.isSQL,simpleObj.selectedTables,simpleObj.starSchemas,simpleObj.dataSourceList,simpleObj.schemaHandle);
  }


  clearSelectedTablesDataSourceID(){
    this.selectedTables=this.selectedTables.map((table:string)=>{
        return table&&table.indexOf(".")>-1?table.split(".")[1]:table;
    });
  }

  _sqlString : string;

  get sqlString() : string{
    return this.isSQL?this.selectedTables[0]:'';
  }

  set sqlString(sql : string){
    this.selectedTables=[sql];
  }

}
