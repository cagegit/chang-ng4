export class Query{
  queryID : string;
  sql : string="";
  createdTime : number;
  updatedTime : number;
  offset: number=0;
  limit:number=10000;
  acceptPartial:boolean=true;
  id : string;

  constructor(queryID?:string, sql?:string, createdTime?:number, updatedTime?:number, limit?:number, id?:string) {
      this.queryID = queryID;
      this.sql = sql?sql:"";
      this.createdTime = createdTime;
      this.updatedTime = updatedTime;
      this.limit = limit;
      this.id = id;
  }

  setDefaultID(){
    this.queryID=this.createUUID();
  }

  createUUID():string {
    let uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
    return uuid;
  }

}
