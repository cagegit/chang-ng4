import {TableJoin} from "./table-join.model";
import {Measure} from "./measure.model";
import {Dimension} from "./dimension.model";
export class StarSchema{
   factTable : string;
   allJoins : Array<TableJoin>=new Array<TableJoin>();
   allMeasures : Measure[]=new Array<Measure>();
   allDimensions : Array<Dimension>=new Array<Dimension>();
   constructor(factTable : string,tableJoins : TableJoin[]=[],allMeasure : Measure[]=[],allDimensions:Dimension[]=[]){
     this.factTable=factTable;
     if(tableJoins){
       tableJoins.forEach((tableJoin : TableJoin)=>{
         this.allJoins.push(new TableJoin(tableJoin.leftTable,tableJoin.leftField,tableJoin.rightTable,tableJoin.rightField));
       });
     }
     if(allMeasure){
       allMeasure.forEach((measure : Measure)=>{
          this.allMeasures.push(new Measure(measure.factTable,measure.fieldName,measure.dataType,measure.measureDisplayName,measure.format,measure.aggregationType));
       });
     }
     if(allDimensions){
       allDimensions.forEach((dimension : Dimension)=>{
         this.allDimensions.push(new Dimension(dimension.dimensionName,dimension.dimensionType,dimension.tableName,dimension.allHierachies));
       });
     }

   }

    clone() : StarSchema{
      return new StarSchema(this.factTable,this.allJoins,this.allMeasures,this.allDimensions);
    }

    get dimesionTopLevel() : string[]{
      let set=new Set<string>();
      this.allDimensions.map((dimension : Dimension)=>{
        set.add(dimension.tableName);
      });
      return Array.from(set).sort((x:string,y:string)=>{
        return x.localeCompare(y);
      });
    }
}
