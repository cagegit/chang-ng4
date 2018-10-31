export class Level{
  levelName : string;
  fieldName : string;
  dataType : string;
  constructor(levelName?:string,fieldName?:string,dataType?:string){
    this.levelName=levelName;
    this.fieldName=fieldName;
    this.dataType=dataType
  }

  get levelShowName() : string{
      return this.levelName?this.levelName:this.fieldName;
  }

  equals(level : Level) : boolean{
    return this.fieldName==level.fieldName;
  }

  clone() : Level{
    return new Level(this.levelName,this.fieldName,this.dataType);
  }

}
