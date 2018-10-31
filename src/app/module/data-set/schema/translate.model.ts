import {DataSourceTableField} from "../../../common/model/data-source-table-field.model";
import {Measure} from "../../../common/model/measure.model";
import {Hierachy} from "../../../common/model/hierachy.model";
import {Level} from "../../../common/model/level.model";
import {SchemaUtil} from "./schema-util";
export class Translate{
  static DATA_TYPE={
    FIELD : 'field',
    MEASURE : 'measure',
    HIERACHY : 'hierachy',
    LEVEL : 'level'
  }

  type : string;
  data : any;

  constructor(type : string,data : any){
    this.type=type;
    switch(type){
      case Translate.DATA_TYPE.FIELD :
        this.data=new DataSourceTableField(data.fieldName,data.fieldType);
        break;
      case Translate.DATA_TYPE.MEASURE :
        this.data=new Measure(data.factTable,data.fieldName,data.dataType,data.measureDisplayName,data.format,data.aggregationType);
        break;
      case Translate.DATA_TYPE.HIERACHY :
        this.data=new Hierachy(data.hierachyName,data.allLevels);
        break;
      case Translate.DATA_TYPE.LEVEL :
        this.data=new Level(data.levelName,data.fieldName,data.fieldType);
        break;
    }
  }

  toLevel() : Level{
    let level;
    switch(this.type){
      case Translate.DATA_TYPE.FIELD :
        level=SchemaUtil.buildLevelByField(this.data)
        break;
      case Translate.DATA_TYPE.HIERACHY :
        level=SchemaUtil.buildLevelByHierachy(this.data)
        break;
    }
    return level;
  }


  toElement(toType) : any {
    let element;
    switch(toType){
      case Translate.DATA_TYPE.MEASURE:{
        let field=this.data as DataSourceTableField;
        let measure=SchemaUtil.buildMeasure("",field);
        element=document.createElement("li");
        let innerHtml;
        if(measure.measureDisplayName){
          innerHtml=`<span>${measure.measureDisplayName}</span>`;
        }else{
          let temp=measure.aggregationTypeShow?`<span>${measure.aggregationTypeShow}</span>`:"";
          innerHtml=`<span><span class="agg_type">${temp}</span><spn>${measure.fieldName}</span></span>`;
        }
        element.innerHTML=innerHtml;
        element.className="selected_item dev-measure";
        break;
      }
      case Translate.DATA_TYPE.HIERACHY:{
        let hierachy : Hierachy;
        if(this.type==Translate.DATA_TYPE.FIELD){
          let field=this.data as DataSourceTableField;
          hierachy=SchemaUtil.buildHierachy(field);
        }
        element=document.createElement("li");
        let innerHtml;
        if(!hierachy.level){
          innerHtml=`<span>${hierachy.hierachyName}</span>`;
        }else{
          innerHtml=`<span>${hierachy.level.levelShowName}</span>`;
        }
        element.innerHTML=innerHtml;
        element.className="selected_item marR20 marB20 self_left";
        break;
      }
      case Translate.DATA_TYPE.LEVEL:{
        let level : Level;
        if(this.type==Translate.DATA_TYPE.FIELD){
          let field=this.data as DataSourceTableField;
          level=SchemaUtil.buildLevelByField(field);
        }else if(this.type==Translate.DATA_TYPE.HIERACHY){
          let hierachy=this.data as Hierachy;
          level=SchemaUtil.buildLevelByHierachy(hierachy);
        }
        element=document.createElement("li");
        let innerHtml;
        if(!level.levelShowName){
          innerHtml=`<span>${level.fieldName}</span>`;
        }else{
          innerHtml=`<span>${level.levelShowName}</span>`;
        }
        element.innerHTML=innerHtml;
        element.className="tree_key_item";
        break;
      }

    }
    console.log("转换结果:",element);
    return element;
  }





  /**
   * 构建Translate对象
   * @param str
   * @returns {Translate}
     */
  static buildTranslate(str : string):Translate{
    let translate=JSON.parse(str) as any;
    return new Translate(translate.type,translate.data);
  }

}
