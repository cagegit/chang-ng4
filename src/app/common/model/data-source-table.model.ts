import {DataSourceTableField} from "./data-source-table-field.model";
export class DataSourceTable{
  tableName : string;
  tableFields : Array<DataSourceTableField>=new Array<DataSourceTableField>();
  priviewData : Array<string>=new Array<string>();
  checked : boolean=false;

  constructor(tableName? : string,tableFields? : DataSourceTableField[],priviewData?:string[]){
      this.tableName=tableName;
      this.priviewData=priviewData?priviewData:[];
      if(tableFields){
        tableFields.forEach((field : DataSourceTableField)=>{
          this.tableFields.push(DataSourceTableField.build(field));
        });
        DataSourceTableField.sort(this.tableFields);
      }else{
        this.tableFields=[];
      }
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : DataSourceTable) : DataSourceTable{
    return new DataSourceTable(simpleObj.tableName,simpleObj.tableFields,simpleObj.priviewData);
  }

  /**
   * 排序
   * @param values
     */
  static sort(values : DataSourceTable[]){
    values.sort((x:DataSourceTable,y:DataSourceTable) => {
      return x.tableName.localeCompare(y.tableName);
    })
  }

  static containsTable(tables:DataSourceTable[],project : DataSourceTable) : boolean {
    return tables.findIndex((temp:DataSourceTable) => {
      return temp.equals(project);
    })>-1?true:false;
  }

  static findTable(tables:DataSourceTable[],project : DataSourceTable) : DataSourceTable {
    return tables.find((temp:DataSourceTable) => {
      return temp.equals(project);
    });
  }

  static clearChecked(tables:DataSourceTable[]) {
    tables=tables.map((temp:DataSourceTable) => {
      temp.checked=false;
      return temp;
    })
  }


  clone() : DataSourceTable{
    return new DataSourceTable(this.tableName,this.tableFields);
  }

  set(tableName? : string,tableFields? : DataSourceTableField[]){
    this.tableName=tableName;
    this.tableFields=tableFields;
  }

  equals(dataSourceTable : DataSourceTable):boolean{
    return this.tableName==dataSourceTable.tableName;
  }

  get dataSourceID() : string{
    return this.tableName.split(".")[0];
  }

  get showTableName() : string{
    return this.tableName.split(".")[1];
  }

}
