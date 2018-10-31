import {
  Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges
} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";
import {Subject, Observable} from "rxjs/Rx";
import {GitDataSource, Project} from "../../../../common/model/git-data-source.model";
import {DataSourceService} from "../../../../common/service/data-source.service";
import {AppNotification} from "../../../../app.notification";
import {Error} from "../../../../common/model/Error"
import {DataSource} from "../../../../common/model/data-source.model";
import {Pagination} from "../../../../common/model/pagination.model";
@Component({
  selector:'branch-select',
  templateUrl: './branch-select.component.html',
  styleUrls: ['./branch-select.component.css']
})
export class BranchSelectComponent implements OnInit,OnChanges {
  @ViewChild('branchSelectModal') branchSelectModal:ModalDirective;
  //输入,输出参数
  @Input() dataSource : GitDataSource;
  @Input() projectName : string;
  searchTermStream = new Subject<any>();
  filterSearch : string="";
  private mockBranchList = new Array(10);
  @Output() projectChange = new EventEmitter();
  @Output() closeChange = new EventEmitter();
  allBranches : string[]=[];
  filterBranches : string[]=[];
  pageBranches : string[]=[];
  selectedBranches : string[]=[];
  project : Project;
  pagination : Pagination=new Pagination(0,0,0);

  constructor(private dataSourceService : DataSourceService,private appNotification : AppNotification){
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((keyword : string) => {
        return Observable.of(keyword);
      }).subscribe((keyword : string) => {
        console.log("输入变更:",keyword);
        this.filterSearch=keyword;
        this.filter();
    });
  }

  ngOnInit() {
   this.initData();
  }

  ngAfterViewInit() {
    this.branchSelectModal.show();
  }

  ngOnChanges(changes: SimpleChanges) {
    let dataSourceChange=changes['dataSource'];
    if(!dataSourceChange.isFirstChange()){
      console.log("数据源变更:",this.dataSource);
      this.initData();
    }
  }

  initData(){
    if(!this.dataSource){
      console.warn("参数错误:dataSource:",this.dataSource);
      return;
    }
    console.log("initData:dataSource=",this.dataSource,this.projectName);
    this.project=this.dataSource.selectedProjects.find((project : Project)=>{
      return project.projectName==this.projectName;
    });
    console.log("initData:project=",this.project);
    this.filter();
  }




  public totalItems:number = 64;
  public currentPage:number = 1;
  public itemsPerPage:number = 10;

  pageChanged(event: any): void {
    this.pagination.gotoPage=event.page;
    this.filter();
  }

  isSelected(branch : string) : boolean{
    console.log("isSelected:",this.project.branches,branch);
    return this.project.branches.findIndex((temp : string)=>{
      return temp==branch;
    })>-1;
  }

  selectBranch(branch : string){
    this.project.branches.push(branch);
    this.filter();
  }

  delBranch(branch : string){
    this.project.branches=this.project.branches.filter((temp : string)=>{
      return temp!=branch;
    });
    this.filter();
  }

  cancel(){
    this.branchSelectModal.hide();
    this.closeChange.emit(true);
  }

  save(){
    this.projectChange.emit(this.project);
    this.cancel();
  }


  /**
   * 搜索
   * @param item
   */
  search(keyword : string) {
    this.searchTermStream.next(keyword);
  }


  filter(){
    let param=this.project.projectName;
    console.log("filter:",this.dataSource.type,this.project.projectName);
    if(this.dataSource.dataSourceType==DataSource.TYPE.ISOURCE){
      param=this.project.projectName.replace(/\//g,"@@");
    }
    this.dataSourceService.findAllBranch(this.dataSource,param,this.pagination.gotoPage,this.filterSearch).subscribe((data : any)=>{
      console.log("ataSourceService.findAllBranch:",data,this.project.branches);
      this.allBranches=data.content;
      this.pagination=data.pagination;
      this.allBranches=this.allBranches.filter((branch : string)=>{
        return !this.isSelected(branch);
      });
    },(error : Error)=>{
      this.appNotification.error(error.errMsg);
    });
  }

  addAll(){
    this.project.branches=this.filterBranches;
    this.filter();
  }

  delAll(){
    this.project.branches=[]
    this.filter();
  }


}
