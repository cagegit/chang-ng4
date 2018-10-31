import {DataSet} from "./data-set.model";
import {DataSourceTable} from "./data-source-table.model";
import {BasePermissionModel} from "./base-permission-model";
export class DataSource extends BasePermissionModel{
   id:string;
   name:string;
   dataSourceID : string;
   dataSourceName : string;
   dataSourceType : string;
   createdTime : number;
   updatedTime : number;
   createdBy : string;
   connectedState : boolean;
   dataSetCount : number;
   tables : DataSourceTable[]=[];
   type : string;

  /**
   * 选中状态,仅限前端使用
   * @type {boolean}
   */
  checked : boolean=false;

   static TYPE={
    MYSQL : "mysql",
    KYLIN : "kylin",
    Hive2 : "hive2",
    CODE : "code",
    ISOURCE : "isource",
    SPARK : "spark",
    IMPALA : "impala",
   }

    DATA_SOURCE_TYPE_MAP : Map<string,string> = new Map([
      [DataSource.TYPE.MYSQL, "最流行的开源关系型数据库"],
      [DataSource.TYPE.KYLIN, "Apache Kylin™ 开源的分布式分析引擎"],
      [DataSource.TYPE.Hive2, "Apache Hive ™ 基于Hadoop的数据仓库工具"],
      [DataSource.TYPE.SPARK, "Apache Spark ™  快速的通用型大数据处理引擎"],
      [DataSource.TYPE.CODE, "CSDN 面向国内开发者提供代码托管平台"],
      [DataSource.TYPE.ISOURCE, "CSDN 企业版代码托管平台"]
    ]);

    get dataSourceTypeDesc() : string{
      return this.DATA_SOURCE_TYPE_MAP.get(this.dataSourceType);
    }

    constructor(userList?:string, permissions?:string[], id?:string, name?:string, dataSourceType?:string, createdTime?:number, updatedTime?:number, createdBy?:string, connectedState?:boolean, dataSetCount?:number, tables?:DataSourceTable[]) {
      super(userList, permissions);
      this.id = id;
      this.name = name;
      this.dataSourceID = id;
      this.dataSourceName = name;
      this.dataSourceType = dataSourceType;
      this.createdTime = createdTime;
      this.updatedTime = updatedTime;
      this.createdBy = createdBy;
      this.connectedState = connectedState;
      this.dataSetCount = dataSetCount;
      if(tables){
        tables.forEach((talbe : DataSourceTable)=>{
          this.tables.push(DataSourceTable.build(talbe));
        });
      }else{
        this.tables=[];
      }
    }

    /**
     * 根据简单对象构建
     * @param simpleObj
     */
    static build(simpleObj : DataSource) : DataSource{
      return new DataSource(simpleObj.userList,simpleObj.permissions,simpleObj.id,simpleObj.name,simpleObj.dataSourceType,simpleObj.createdTime,simpleObj.updatedTime,simpleObj.createdBy,simpleObj.connectedState,simpleObj.dataSetCount,simpleObj.tables);
    }


    clone(){
      return DataSource.build(this);
    }


/*    /!**
     * 根据DataSet信息,构造简单的DataSource对象
     * @param datSourceID
     * @param name
     * @param dataSourceType
     * @returns {DataSource}
     *!/
   static buildFromDataSet(dataSet : DataSet){
     let dataSource=new DataSource();
     dataSource.id=dataSet.id;
     dataSource.name=dataSet.name;
     dataSource.dataSourceType=dataSet.dataSourceType;
     return dataSource;
   }*/

   static buildFromDataSet(dataSet : DataSet):DataSource[]{
     let arr:DataSource[]=[];
     dataSet.dataSourceList.forEach((dataSource : DataSource)=>{
       let newDataSource=new DataSource();
       newDataSource.id=dataSource.id;
       newDataSource.name=dataSource.name;
       newDataSource.dataSourceType=dataSource.dataSourceType;
       arr.push(newDataSource);
     });
     return arr;
   }


    public match(dataSource : DataSource) : boolean{
      return this.id==dataSource.id;
    }


    /**
     * 排序
     * @param values
     */
    static sort(values : DataSource[]){
      values.sort((x:DataSource,y:DataSource) => {
        return x.name.localeCompare(y.name);
      })
    }
}
