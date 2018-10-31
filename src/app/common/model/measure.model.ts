import {SchemaUtil} from "../../module/data-set/schema/schema-util";
export class Measure{
  factTable : string;
  fieldName : string;
  dataType : string="";
  measureDisplayName : string;
  format : string;
  aggregationType : string;



  equals(dimension : Measure) : boolean{
    return this.factTable==dimension.factTable&&this.fieldName==dimension.fieldName;
  }

  constructor(factTable? : string,fieldName? : string,dataType : string="",measureDisplayName? : string,format? : string ,aggregationType? : string){
    this.factTable=factTable;
    this.fieldName=fieldName;
    this.dataType=dataType;
    this.measureDisplayName=measureDisplayName;
    this.format=format;
    this.aggregationType=aggregationType;
  }

  clone() : Measure{
    return new Measure(this.factTable,this.fieldName,this.dataType,this.measureDisplayName,this.format,this.aggregationType);
  }


  /**
   * 模型编辑页,展示使用
   * @returns {string}
     */
  get aggregationTypeShow() : string{
     return this.aggregationType!=SchemaUtil.MEASURE_AGGREGATIONTYPE.DEFAULT.NONE?this.aggregationType:null;
  }

  get schemaShowType() : string{
    return SchemaUtil.schemaShowType(this.dataType);
  }


}
