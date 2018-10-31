export class Manifest{
  project : string;
  organization : string;
  url: string;
  //1 全部 0 部分
  allBranchFlag : number;
  branchesNum : number;
  updatedNum : number;
  lastPulledTime : number;
  lastUpdateTime : number;
  status : string;
  branches: string[];
  static ALL_BRANCH_FLAG={
    ALL : 1,
    SELECT : 0
  }
  constructor(project?:string, organization?:string, url?:string, allBranchFlag?:number, branchesNum?:number, updatedNum?:number, lastPulledTime?:number, lastUpdateTime?:number, status?:string,branches?:string[]) {
      this.project = project;
      this.organization = organization;
      this.url = url;
      this.allBranchFlag = allBranchFlag;
      this.branchesNum = branchesNum;
      this.updatedNum = updatedNum;
      this.lastPulledTime = lastPulledTime;
      this.lastUpdateTime = lastUpdateTime;
      this.status = status;
      this.branches=branches?branches:[];
  }

  get manifestID() : string{
    return `${this.organization}/${this.project}`;
  }

  clone(){
    return new Manifest(this.project,this.organization,this.url,this.allBranchFlag,this.branchesNum,this.updatedNum,this.lastPulledTime,this.lastUpdateTime,this.status,this.branches);
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : Manifest) : Manifest{
    return new Manifest(simpleObj.project,simpleObj.organization,simpleObj.url,simpleObj.allBranchFlag,simpleObj.branchesNum,simpleObj.updatedNum,simpleObj.lastPulledTime,simpleObj.lastUpdateTime,simpleObj.status,simpleObj.branches);
  }
}
