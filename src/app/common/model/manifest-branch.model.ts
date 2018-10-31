export class ManifestBranch{
  //全部分支
  branches: string[];
  //已选择分支
  selectedBranches: string[];
  allBranchFlag: number;


  constructor(branches?:string[], selectedBranches?:string[], allBranchFlag?:number) {
    this.branches = branches;
    this.selectedBranches = selectedBranches;
    this.allBranchFlag = allBranchFlag;
  }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : any) : ManifestBranch{
    return new ManifestBranch(simpleObj.branches,simpleObj.selectedBranches,simpleObj.allBranchFlag);
  }

  /**
   * 判断是否已经选中
   * @param branch
   * @returns {boolean}
     */
  checked(branch):boolean{
    return this.selectedBranches.findIndex((temp:string)=>{
      return  branch==temp;
    })>-1;
  }

  /**
   * 取消已经选中的
   * @param branch
     */
  checkedToggle(branch){
    if(!this.checked(branch)){
      this.selectedBranches.push(branch);
    }else{
      this.selectedBranches=this.selectedBranches.filter((temp:string)=>{
        return  branch!=temp;
      });
    }
  }


}
