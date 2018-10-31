/**
 * Created by houxh on 2017-5-18.
 */
export class QueryResult{
  columnMetaList:QueryMeta[];
  results:Array<object[]>;
  totalCount:number;
  columnCount:number;
}
export class QueryMeta{
  columnName:string;
  columnType:string;
}
/**
 * 保存card时所用实体
 */
export class QueryInfo{
  sqlStr:string;
  queryMeta:QueryMeta[];
  dimensionIndexs:ShowColumn[];
  measureIndexs:ShowColumn[];
  properties:any;
  queryType:string;
}
export class QueryResultInfo{
  queryResult:QueryResult;
  dimensionIndexs:ShowColumn[];
  measureIndexs:ShowColumn[];
  properties:any;
}
export class ShowColumn {
  showName: string;
  showType: string;
  index: number;
  selected: boolean;
}
export class chartOptions{
  "saiku.ui.render.mode"= "table";
}
