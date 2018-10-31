import {DataSource} from "./data-source.model";
import {DataSourceTable} from "./data-source-table.model";

export class Project{
  projectName : string;
  checked : boolean=false;
  branches : string[]=[];
  constructor(projectName? : string,branches? : string[]){
    this.projectName=projectName;
    if(branches){
      this.branches=branches.slice();
    }else{
      this.branches=[];
    }
  }

  static build(simpleObj : Project) : Project{
    return new Project(simpleObj.projectName,simpleObj.branches);
  }

  equals(project : Project):boolean{
    return this.projectName==project.projectName;
  }

  clone(){
    return Project.build(this);
  }


  /***
   * 按照字符排序
   * @param a
   * @param b
   * @param order 升序true 降序 false 默认升序
   */
  static sortProject(projects:Project[]) {
    projects.sort((x:Project,y:Project) => {
      return x.projectName.localeCompare(y.projectName);
    })
  }

  static containsProject(projects:Project[],project : Project) : boolean {
    return projects.findIndex((temp:Project) => {
      return temp.equals(project);
    })>-1?true:false;
  }

  static findProject(projects:Project[],project : Project) : Project {
    return projects.find((temp:Project) => {
      return temp.equals(project);
    });
  }

  static clearChecked(projects:Project[]) {
    projects=projects.map((temp:Project) => {
      temp.checked=false;
      return temp;
    })
  }

}

/**
 * code/git/git hub数据模型
 */
export class GitDataSource extends DataSource{
  /**服务器IP地址**/
  gitHost : string;
  /**git用户名**/
  gitUsername : string;
  /**git密码**/
  gitPassword : string;
  /**已选择的项目列表**/
  selectedProjects : Project[]=[];
  //1 全部 0 部分
  allBranchFlag : number=1;
  type : string="CodeDataSource";
  static ALL_BRANCH_FLAG={
    ALL : 1,
    SELECT : 0
  }

    constructor(userList?:string, permissions?:string[], dataSourceID?:string, dataSourceName?:string, dataSourceType?:string, createdTime?:number, updatedTime?:number, createdBy?:string, connectedState?:boolean, dataSetCount?:number, tables?:DataSourceTable[], gitHost?:string, gitUsername?:string, gitPassword?:string, selectedProjects?:Project[]) {
      super(userList, permissions, dataSourceID, dataSourceName, dataSourceType, createdTime, updatedTime, createdBy, connectedState, dataSetCount, tables);
      this.gitHost = gitHost;
      this.gitUsername = gitUsername;
      this.gitPassword = gitPassword;
      if(selectedProjects&&selectedProjects.length>0){
        selectedProjects.forEach((project : Project)=>{
          this.selectedProjects.push(Project.build(project));
        });
        this.allBranchFlag=0;
      }else{
        this.selectedProjects=[];
        this.allBranchFlag=1;
      }
    }

    static build(simpleObj : GitDataSource) : GitDataSource{
      return new GitDataSource(simpleObj.userList,simpleObj.permissions,simpleObj.dataSourceID,simpleObj.dataSourceName,simpleObj.dataSourceType,simpleObj.createdTime,simpleObj.updatedTime,simpleObj.createdBy,simpleObj.connectedState,simpleObj.dataSetCount,simpleObj.tables,simpleObj.gitHost,simpleObj.gitUsername,simpleObj.gitPassword,simpleObj.selectedProjects);
    }
}
