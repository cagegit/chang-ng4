export class TableJoin{
  leftTable : string;
  leftField : string;
  rightTable : string;
  rightField : string;

  public match(tableJoin : TableJoin) : boolean{
    return this.leftTable===tableJoin.leftTable&&
        this.leftField===tableJoin.leftField&&
        this.rightTable===tableJoin.rightTable&&
        this.rightField===tableJoin.rightField;
  }


  constructor(leftTable?:string, leftField?:string, rightTable?:string, rightField?:string) {
      this.leftTable = leftTable;
      this.leftField = leftField;
      this.rightTable = rightTable;
      this.rightField = rightField;
      }
}
