import {Component, OnInit, ViewChild, EventEmitter, Output, Input} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";
import {AppNotification} from "../../../app.notification";
import {Error} from "../../../common/model/Error"
import {Manifest} from "../../../common/model/manifest.model";
import {ManifestService} from "../../../common/service/manifest.service";
import {Observable, Subject} from "rxjs/Rx";
import {ManifestBranch} from "../../../common/model/manifest-branch.model";
import {Pagination} from "../../../common/model/pagination.model";
@Component({
  selector:'manifest-update',
  templateUrl: './manifest-update.component.html',
  styleUrls: ['./manifest-update.component.css']
})
export class ManifestUpdateComponent implements OnInit {
  nextText = `<i class="iconfont icon-jiantouzuo"></i>上一页`;
  previousText = `下一页<i class="iconfont icon-jiantouyou"></i>`;
  @ViewChild('manifestUpdateModal') manifestUpdateModal:ModalDirective;
  @Input() manifest: Manifest;
  @Output() closeChange = new EventEmitter();
  searchTermStream = new Subject<string>();
  searchText : string;
  pagination : Pagination=new Pagination(10,1,1);
  manifestBranch: ManifestBranch=new ManifestBranch();
  inputBranches : string="";
  constructor(private appNotification : AppNotification,private manifestService : ManifestService){
      this.manifestBranch.allBranchFlag=1;
      this.searchText="";
  }

  ngOnInit() {
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((term:string) => {
        return Observable.of(term)
      }).subscribe((term:string) => {
      this.filter(term);
    });
    this.refreshList();
  }

  updateSelectType(value : number){
    this.manifestBranch.allBranchFlag=value;
    this.manifestService.updateBranches(this.manifest.manifestID,this.manifestBranch).subscribe((data : any)=>{
      this.appNotification.success("编辑成功!");
      if(this.manifestBranch.allBranchFlag==Manifest.ALL_BRANCH_FLAG.SELECT){
        this.refreshList();
      }
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }

  /**
   * 搜索
   * @param item
   */
  search(item:string) {
    this.searchTermStream.next(item);
  }

  filter(value : any){
    this.searchText=value;
    this.refreshList();
  }

  refreshList(){
    this.manifestService.findBranches(this.manifest.manifestID,this.pagination.gotoPage,this.searchText).subscribe((data : any)=>{
      this.pagination=data.pagination;
      this.manifestBranch=data.content;
      console.info("refreshList:",this.manifestBranch);
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

  checkedToggle(branch : string){
    this.manifestBranch.checkedToggle(branch);
    this.manifestService.updateBranches(this.manifest.manifestID,this.manifestBranch).subscribe((data : any)=>{
      this.appNotification.success("编辑成功!");
    },(error )=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }


  formSubmit(){
    if(this.inputBranches&&this.manifestBranch.allBranchFlag==Manifest.ALL_BRANCH_FLAG.SELECT){
      this.manifestBranch.selectedBranches=this.manifestBranch.selectedBranches.concat(this.inputBranches.split(";"));
    }
    this.manifestService.updateBranches(this.manifest.manifestID,this.manifestBranch).subscribe((data : any)=>{
      this.appNotification.success("编辑成功!");
      setTimeout(()=>{
        this.closeHandle(true);
      },1000);
    },(error)=>{
      if(error.errCode!=404){
        this.appNotification.error(error.errMsg);
      }
    });
  }




  show(){
    this.manifestUpdateModal.show();
  }

  ngAfterViewInit() {
    this.manifestUpdateModal.show();
  }
  closeHandle(refresh:boolean=false) {
    this.manifestUpdateModal.hide();
    this.closeChange.emit(refresh);
  }
}
