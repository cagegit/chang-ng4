import {TenantDTO} from "../dto/TenantDTO";
export class Tenant{
  tenantName : string;
  active : boolean;
  domainName : string;
  createdTime : number;
  createdBy : string;
  numOfDashboards : number;
  numOfDataSources : number;
  numOfDataSets : number;
  numOfGroups : number;
  numOfUsers : number;

  constructor(){
  }

  static buildFromTenantDTO(tenantDTO : TenantDTO){
    let temp=new Tenant();
    temp.tenantName=tenantDTO.email;
    temp.active=tenantDTO.active;
    temp.domainName=tenantDTO.domainName;
    temp.createdTime=tenantDTO.createdDate;
    temp.createdBy=tenantDTO.createdBy;
    temp.numOfDashboards=tenantDTO.numOfDashboards;
    temp.numOfDataSources=tenantDTO.numOfDataSources;
    temp.numOfDataSets=tenantDTO.numOfDataSets;
    temp.numOfGroups=tenantDTO.numOfGroups;
    temp.numOfUsers=tenantDTO.numOfUsers;
    return temp;
  }


}
