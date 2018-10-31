export class Permission{
  public id : number;
  public name : string;
  public code : string;
  public isAllowed : boolean;
  constructor(id : number,name : string,code : string, isAllowed : boolean){
      this.id=id;
    this.name=name;
    this.code='';
    this.isAllowed=isAllowed;
  }

}
