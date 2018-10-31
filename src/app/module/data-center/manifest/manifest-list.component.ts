import {Component, OnInit} from "@angular/core";
import {Subject, Observable} from "rxjs/Rx";
import {Manifest} from "../../../common/model/manifest.model";
import {Error} from "../../../common/model/Error"
import {AppNotification} from "../../../app.notification";
import {ManifestService} from "../../../common/service/manifest.service";
import {Router} from "@angular/router";
import {Pagination} from "../../../common/model/pagination.model";
@Component({
  templateUrl: './manifest-list.component.html',
  styleUrls: ['./manifest-list.component.css']
})
export class ManifestListComponent implements OnInit{
  nextText = `<i class="iconfont icon-jiantou-copy"></i>`;
  previousText = `<i class="iconfont icon-jiantouy-copy"></i>`;
  searchTermStream = new Subject<string>();
  modal : any={};
  /**
   * 筛选条件
   * @type {DataSet}
   */
  filterManifest : Manifest=new Manifest();
  manifestList : Manifest[];
  currentManifest : Manifest;
  pagination : Pagination=new Pagination(10,1,1);
  constructor(public router:Router,private manifestService : ManifestService, private appNotification : AppNotification){
      this.filterManifest.project="";
  }
  ngOnInit():void {
    this.refreshList();
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((term:string) => {
        return Observable.of(term)
      }).subscribe((term) => {
      this.filter("project",term);
    });
  }

  refreshList(refresh:boolean=true){
    this.modal={
      upload : false,
      update : false,
      add : false
    }
    if(!refresh){
      return;
    }
    this.manifestService.find(this.pagination.gotoPage,this.filterManifest.project).subscribe((data : any)=>{
      console.log("初始化数据源列表:",data);
      this.manifestList=data.content;
      this.pagination=data.pagination;
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }

  pageChanged(event: any): void {
    this.pagination.gotoPage=event.page;
    this.refreshList();
  }

  /**
   * 搜索
   * @param item
   */
  search(item:string) {
    this.searchTermStream.next(item);
  }

  filter(field : string, value : any){
    this.filterManifest[field]=value;
    console.log("过滤条件:", this.filterManifest);
    this.refreshList();
  }

  delete(manifestID : string){
    this.manifestService.delete(manifestID).subscribe(()=>{
      this.manifestList=this.manifestList.filter((temp : Manifest)=>{
        return manifestID!=temp.manifestID;
      });
    },(error)=>{
      this.appNotification.error(error.errMsg);
    })
  }

  openModal(modalFlag : string,manifest? : Manifest){
    this.modal[modalFlag]=true;
    this.currentManifest=manifest;
  }



}
