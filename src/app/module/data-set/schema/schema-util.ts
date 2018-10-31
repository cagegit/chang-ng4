import {DataSourceTableField} from "../../../common/model/data-source-table-field.model";
import {Measure} from "../../../common/model/measure.model";
import {Dimension} from "../../../common/model/dimension.model";
import {Hierachy} from "../../../common/model/hierachy.model";
import {Level} from "../../../common/model/level.model";
import {DataSet} from "../../../common/model/data-set.model";
import {StarSchema} from "../../../common/model/star-schema.model";
/**
 * 模型工具类
 */
export class SchemaUtil{
  //API网关接口
  public  static MEASURE_FORMAT={
    //用户相关接口
    NONE :'NONE',
    FORMAT_1 : '整数（0）',
    FORMAT_2 : '千分位(100,000)',
    FORMAT_3 : '百分比（1.0%）'
  }

  public static MEASURE_AGGREGATIONTYPE={
    //用户相关接口
    DEFAULT : {
      NONE : 'NONE'
    },
    NUMBER : {
      SUM : 'SUM',
      AVERAGE : 'AVERAGE',
      COUNT : 'COUNT',
      COUNT_DISTINCT : 'COUNT_DISTINCT',
      MINIMUM : 'MINIMUM',
      MAXIMUM : 'MAXIMUM'
    },
    STRING : {
      SUM : 'SUM',
      COUNT : 'COUNT',
      COUNT_DISTINCT : 'COUNT_DISTINCT'
    },
    TIME : {
      MINIMUM : 'MINIMUM',
      MAXIMUM : 'MAXIMUM'
    }
  }
  static STRING_TYPE_SET : Set<string>=new Set(["char", "varchar", "boolean", "bit"]);
  static NUMBER_TYPE_SET : Set<string>=new Set(["int","bigint", "integer", "numeric", "smallint","tinyint","decimal","double","float"]);
  static TIME_TYPE_SET : Set<string>=new Set(["date", "time", "timestamp", "bit"]);
  static SHOW_TYPE={
    //用户相关接口
    STRING : "string",
    NUMBER : "number",
    TIME : "time",
    NONE : "",
  }

  static schemaShowType(fieldType : string) : string{
    let showType;
    fieldType=fieldType.toLowerCase();
    switch (true){
      case SchemaUtil.STRING_TYPE_SET.has(fieldType):
        showType=SchemaUtil.SHOW_TYPE.STRING;
        break;
      case SchemaUtil.NUMBER_TYPE_SET.has(fieldType):
        showType=SchemaUtil.SHOW_TYPE.NUMBER;
        break;
      case SchemaUtil.TIME_TYPE_SET.has(fieldType):
        showType=SchemaUtil.SHOW_TYPE.TIME;
        break;
      default :
        showType=SchemaUtil.SHOW_TYPE.NONE;;
        break;
    }
    return showType;
  }

  static MEASURE_AGGREGATIONTYPE_ARR(showType : string=""): string[]{
    let set =new Set<string>([SchemaUtil.MEASURE_AGGREGATIONTYPE.DEFAULT.NONE]);
    let kv;
    if(SchemaUtil.MEASURE_AGGREGATIONTYPE.hasOwnProperty(showType.toUpperCase())){
      kv=SchemaUtil.MEASURE_AGGREGATIONTYPE[showType.toUpperCase()];
      for(let k in kv){
        set.add(kv[k]);
      }
    }else{
      console.log("限制展示类型",showType);
      for(let type in SchemaUtil.MEASURE_AGGREGATIONTYPE){
        kv=SchemaUtil.MEASURE_AGGREGATIONTYPE[type];
        console.log("kv:",JSON.stringify(set),JSON.stringify(kv));
        for(let k in kv){
          console.log("add:",k,kv[k]);
          set.add(kv[k]);
        }
      }
    }
    console.log("set",set);
    return Array.from(set);
  }



  /**
   * 构建指标属性
   * @param tableName
   * @param field
   * @returns {Measure}
     */
  static buildMeasure(tableName : string,field : DataSourceTableField) : Measure{
    console.info("buildMeasure:",field,field.schemaShowType);
    let temp : string;
    switch (field.schemaShowType){
      case 'string' :
        temp=SchemaUtil.MEASURE_AGGREGATIONTYPE.NUMBER.COUNT;
        break;
      case 'number' :
        temp=SchemaUtil.MEASURE_AGGREGATIONTYPE.STRING.SUM;
        break;
      default :
        temp=SchemaUtil.MEASURE_AGGREGATIONTYPE.DEFAULT.NONE;
        break;
    }
    return new Measure(tableName,field.fieldName,field.fieldType,"",SchemaUtil.MEASURE_FORMAT.NONE,temp);
  }

  static buildHierachy(field : DataSourceTableField) : Hierachy{
    let level=SchemaUtil.buildLevelByField(field);
    let hierachy=new Hierachy(field.fieldName,new Array<Level>(level));
    return hierachy;
  }

  static buildLevelByField(field : DataSourceTableField) : Level{
    return new Level(field.fieldName,field.fieldName,field.fieldType);
  }

  static buildLevelByHierachy(hierachy : Hierachy) : Level{
    return hierachy.level;
  }

  static fixSQL(dataSet : DataSet){
    if(dataSet.isSQL){
      dataSet.selectedTables[0]='UNION_TABLE';
    }
  }

  /**
   * 修复Schemas值
   * @param dataSet
     */
  static fixSchemas(dataSet? : DataSet):void{
    // console.warn("fix start:",dataSet);
    if(dataSet&&dataSet.starSchemas[0].constructor!=StarSchema){
      // console.warn("fix ing... ...");
      dataSet.starSchemas=dataSet.starSchemas.map((obj : StarSchema)=>{
        return new StarSchema(obj.factTable,obj.allJoins,obj.allMeasures,obj.allDimensions);
      });
      // console.warn("fix end: ",dataSet);
    }
  }

  /**
   * 修改DataSet中的starSchema,返回一个新的dataSet,原DataSet不变
   * @param dataSet
   * @param starSchema
   * @returns {(DataSet&{starSchemas: any, starSchemas: any})|any}
     */
  static modifyStarSchema(starSchemas : StarSchema[],starSchema : StarSchema) : StarSchema[]{
    return starSchemas.map((oldStarSchema : StarSchema)=>{
      if(oldStarSchema.factTable==starSchema.factTable){
        oldStarSchema=starSchema;
      }
      return oldStarSchema;
    });
  }

  static modifyDimension(dimensionList : Dimension[],dimension : Dimension) : Dimension[]{
    return dimensionList.map((old : Dimension)=>{
      if(old.equals(dimension)){
        old=dimension;
      }
      return old;
    });
  }

  static getDimensionCount(dimensionList : Dimension[]){
    let count:number=0;
    dimensionList.forEach((old : Dimension)=>{
      count+=old.allHierachies.length;
    });
    return count;
  }


  /**
   * 深度拷贝Dimension[]
   * @param dimensionArr
   * @returns {Array}
   */
  static cloneStarSchemaArr(starSchemaArr : StarSchema[]) : StarSchema[]{
    let arr=[];
    if(starSchemaArr){
      starSchemaArr.forEach((starSchema : StarSchema)=>{
        arr.push(starSchema.clone());
      });
    }
    return arr;
  }

  /**
   * 深度拷贝Dimension[]
   * @param dimensionArr
   * @returns {Array}
     */
  static cloneDimensionArr(dimensionArr : Dimension[]) : Dimension[]{
    let arr=[];
    if(dimensionArr){
      dimensionArr.forEach((dimension : Dimension)=>{
        arr.push(new Dimension(dimension.dimensionName,dimension.dimensionType,dimension.tableName,dimension.allHierachies));
      });
    }
    return arr;
  }

  /**
   * 深度拷贝Measure[]
   * @param measureArr
   * @returns {Array}
     */
  static cloneMeasureArr(measureArr : Measure[]) : Measure[]{
    let arr=[];
    if(measureArr){
      measureArr.forEach((measure : Measure)=>{
        arr.push(new Measure(measure.factTable,measure.fieldName,measure.dataType,measure.measureDisplayName,measure.format,measure.aggregationType));
      });
    }
    return arr;
  }

  static cloneLevelArr(allLevels : Level[]) : Level[]{
    let arr=[];
    if(allLevels){
      allLevels.forEach((level : Level)=>{
        arr.push(new Level(level.levelName,level.fieldName,level.dataType));
      });
    }
    return arr;
  }

}
