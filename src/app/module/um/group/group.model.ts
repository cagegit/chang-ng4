export class Group{
  public groupId : number;
  public groupName : string;
  public dataSetList : DataSet[];
  public userList : User[];
  constructor(groupId:number, groupName:string) {
      this.groupId = groupId;
      this.groupName = groupName;
  }
}
export class DataSet{
  public dataSetId : number;
  public dataSetName : string;
}

export  class User{
  public userId : number;
  public userName : string;
}
