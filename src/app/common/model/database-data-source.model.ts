import {DataSource} from "./data-source.model";
import {DataSourceTable} from "./data-source-table.model";
export class DatabaseDataSource extends DataSource{
  hostname : string;
  databaseName : string;
  databasePort : number;
  databaseType : number;
  username : string;
  password : string;

  type : string="DatabaseDataSource";


  constructor(userList?:string, permissions?:string[], dataSourceID?:string, dataSourceName?:string, dataSourceType?:string, createdTime?:number, updatedTime?:number, createdBy?:string, connectedState?:boolean, dataSetCount?:number, tables?:DataSourceTable[], hostname?:string, databaseName?:string, databasePort?:number, databaseType?:number, username?:string, password?:string) {
      super(userList, permissions, dataSourceID, dataSourceName, dataSourceType, createdTime, updatedTime, createdBy, connectedState, dataSetCount, tables);
      this.hostname = hostname;
      this.databaseName = databaseName;
      this.databasePort = databasePort;
      this.databaseType = databaseType;
      this.username = username;
       this.password = password;
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : DatabaseDataSource) : DatabaseDataSource{
    return new DatabaseDataSource(simpleObj.userList,simpleObj.permissions,simpleObj.dataSourceID,simpleObj.dataSourceName,simpleObj.dataSourceType,simpleObj.createdTime,simpleObj.updatedTime,simpleObj.createdBy,simpleObj.connectedState,simpleObj.dataSetCount,simpleObj.tables,simpleObj.hostname,simpleObj.databaseName,simpleObj.databasePort,simpleObj.databaseType,simpleObj.username,simpleObj.password);
  }

}
