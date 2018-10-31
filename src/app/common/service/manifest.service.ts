import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Manifest} from "../model/manifest.model";
import {Observable} from "rxjs/Rx";
import {DomainFactory} from "../DomainFactory";
import {CFG} from "../CFG";
import {AppNotification} from "../../app.notification";
import {Pagination} from "../model/pagination.model";
import {ManifestBranch} from "../model/manifest-branch.model";



const MANIFEST = [
  {
    project : "项目名称",
    organization : "阻止名称名称",
    url: "http://www.baidu.com",
    allBranchFlag : 0,
    branchesNum : "12",
    updatedNum : 21,
    lastPulledTime : 1491458999181,
    lastUpdateTime : 1491458999181,
    status : "123"
  },
  {
    project : "项目名称2",
    organization : "阻止名称名称",
    url: "http://www.baidu.com",
    allBranchFlag : 0,
    branchesNum : "12",
    updatedNum : 21,
    lastPulledTime : 1491458999181,
    lastUpdateTime : 1491458999181,
    status : "123"
  }
]

const MANIFEST_BRANCH = {
  ManifestBranches: {
    pagination: {
      per_page: 10,
      total: 3,
      page: 1
    },
    branches: [
      "aa",
      "bb",
      "dd"
    ],
    selectedBranches: [
      "aa",
      "bb"
    ],
    allBranchFlag: 1
  }
}




MANIFEST_BRANCH.ManifestBranches.pagination


@Injectable()
export class ManifestService{

  constructor(private http: Http,private appNotification:AppNotification){

  }

  /**
   * 获取数据集列表
   * @param manifest
   * @returns {any}
   */
  find(page : number,query : string) : Observable<any>{
    return this.http.get(CFG.API.MANIFEST+`/list?page=${page}&query=${query}`).map((response : Response)=>{
      if(response.status!=204) {
        let list:any = response.json().MainfesItemDetailList.manifests.map((obj:any)=> {
          return Manifest.build(obj);
        });
        let data = {
          pagination: Pagination.build(response.json().MainfesItemDetailList.pagination),
          content: list
        };
        return data;
      }else{
        return [];
      }
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  save(manifest : Manifest) : Observable<any>{
    let body = {
    "ManifestItem":manifest
     }
    return this.http.post(CFG.API.MANIFEST,body).catch(this.errHandle);
  }

  update(manifest : Manifest) : Observable<any>{
    return Observable.of("").delay(1000);
  }

  findBranches(manifestID : string,page : number,query : string) : Observable<any>{
    return this.http.get(CFG.API.MANIFEST+`/${manifestID}/branches?page=${page}&query=${query}`).map((response : Response)=>{
      let data={
        pagination : Pagination.build(response.json().ManifestBranches.pagination),
        content : ManifestBranch.build(response.json().ManifestBranches)
      };
      return data;
    }).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });

  }

  updateBranches(manifestID : string,manifestBranch : ManifestBranch) : Observable<any>{
    let body = {
      "ManifestBranches":manifestBranch
    }
    return this.http.put(CFG.API.MANIFEST+`/${manifestID}/branches`,body).catch(this.errHandle);
  }


  /**
   * 删除数据集
   * @param manifestId
   * @returns {any}
   */
  delete(manifestId : string) : Observable<any>{
    return this.http.delete(CFG.API.MANIFEST+`/${manifestId}`).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  /**
   * 删除数据集
   * @param manifestId
   * @returns {any}
   */
  upload(manifestId : string) : Observable<any>{
    return this.http.delete(CFG.API.MANIFEST+`/${manifestId}`).catch((response : Response)=>{
      let errMsg=DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }


  getById(manifestId:string) : Observable<any>{
    return this.http.get(CFG.API.MANIFEST+`/${manifestId}`).map((r:Response) => {
      return r.json().Manifest;
    }).catch(this.errHandle);
  }

  errHandle(r:Response) {
    let errMsg=DomainFactory.buildError(r.json());
    return Observable.throw(errMsg);
  }


}
