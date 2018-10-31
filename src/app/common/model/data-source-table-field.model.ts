import {Measure} from "./measure.model";
import {SchemaUtil} from "../../module/data-set/schema/schema-util";
export class DataSourceTableField{
  fieldName : string;
  fieldType : string;

  constructor(fieldName?:string,fieldType?:string){
    this.fieldName=fieldName;
    this.fieldType=fieldType;
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : DataSourceTableField) : DataSourceTableField{
    return new DataSourceTableField(simpleObj.fieldName,simpleObj.fieldType);
  }

  /**
   * 排序
   * @param values
   */
  static sort(values : DataSourceTableField[]){
    values.sort((x:DataSourceTableField,y:DataSourceTableField) => {
      return x.fieldName.localeCompare(y.fieldName);
    })
  }


  SHOW_TYPE_CSS_MAP : Map<string,string> = new Map([
    [SchemaUtil.SHOW_TYPE.STRING, "icon-abc"],
    [SchemaUtil.SHOW_TYPE.NUMBER, "icon-kongjianshuzhiqujian"],
    [SchemaUtil.SHOW_TYPE.TIME, "icon-riqi"],
    [SchemaUtil.SHOW_TYPE.NONE, ""]
  ]);

  get schemaShowType() : string{
    return SchemaUtil.schemaShowType(this.fieldType);
  }

  get schemaShowCSS() : string{
    return this.SHOW_TYPE_CSS_MAP.get(this.schemaShowType);
  }

  get isNumberType() : boolean{
    return this.schemaShowType=="number";
  }



}
