import {Hierachy} from "./hierachy.model";
export class Dimension{
  dimensionName : string;
  dimensionType : string;
  tableName : string;
  allHierachies : Array<Hierachy>=new Array<Hierachy>();

  constructor(dimensionName? : string,dimensionType?:string,tableName?:string,allHierachies:Hierachy[]=[]){
      this.dimensionName=dimensionName;
      this.dimensionType=dimensionType;
      this.tableName=tableName;
      if(allHierachies){
        allHierachies.forEach((hierachy : Hierachy)=>{
          this.allHierachies.push(new Hierachy(hierachy.hierachyName,hierachy.allLevels));
        });
      }
  }

  equals(dimension : Dimension) : boolean{
      return this.tableName==dimension.tableName;
  }

  clone() : Dimension{
    return new Dimension(this.dimensionName,this.dimensionType,this.tableName,this.allHierachies);
  }

}
