export class DashboardTemplate {
  constructor(public templateID:string,public templateName:string,public dataSourceType:string,public dashboardID:string ){
  }
  static build(obj:any){
    //TODO:待删除
    return new DashboardTemplate(obj.id,obj.name,obj.dataSourceType,obj.dashboardID);
  }
}
