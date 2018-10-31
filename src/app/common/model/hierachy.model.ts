import {Level} from "./level.model";
export class Hierachy{
  hierachyName : string;
  allLevels : Array<Level>=new Array<Level>();

  constructor(hierachyName? : string,allLevels : Level[]=[]){
    this.hierachyName=hierachyName;
    if(allLevels){
      allLevels.forEach((level : Level)=>{
        this.allLevels.push(new Level(level.levelName,level.fieldName,level.dataType));
      });
    }

  }


  /**
   * 获取当前节点,如果有子节点,返回null
   * @returns {any}
     */
  get level() : Level{
    if(this.allLevels.length==1&&this.hierachyName==this.allLevels[0].levelName){
      return this.allLevels[0];
    }
    return null;
  }

  equals(hierachy : Hierachy){
    if(this.level){
      return hierachy.level?this.level.equals(hierachy.level):false;
    }else{
      return this.hierachyName==hierachy.hierachyName;
    }
  }
  
  clone(){
    return new Hierachy(this.hierachyName,this.allLevels);
  }
  
}
