import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Renderer,
  AfterViewInit
} from "@angular/core";
import { DataSet } from "../../common/model/data-set.model";
import { ActivatedRoute, Router } from "@angular/router";
import { AppNotification } from "../../app.notification";
// import {DataSetService} from "../../common/service/data-set.service";
import { computeMinHeight } from "../../common/service/compute-min-height";
import { Error } from "../../common/model/Error";
import { ResourcePermission } from "../../common/model/resource-permission.model";
import { ModalDirective } from "ng2-bootstrap";
import { SchemaHandle } from "../../common/model/schema-handle.model";
import { flyIn } from "../../animations";
import { SchemaHandleComponent } from "./schema/schema-handle.component";
import { DataCardService } from './data-card.service';
@Component({
  templateUrl: "./data-set.component.html",
  styleUrls: ["./data-set.component.css"],
  encapsulation: ViewEncapsulation.None,
  animations: [flyIn]
})
export class DataSetComponent implements OnInit, AfterViewInit {
  dataSet: DataSet = new DataSet();
  tab: string = "";
  @ViewChild("dataSetBox")
  dataSetBox: ElementRef;
  @ViewChild("computeSchame")
  computeSchame: ModalDirective;
  schameLayerFlag: boolean = false;
  PERMISSION_TYPE: any = ResourcePermission.PERMISSION_TYPE;
  RESOURCE_TYPE_DATA_SET: string = ResourcePermission.RESOURCE_TYPE.DATA_SET;
  SCHEMA_HANDLE_STATUS: any = SchemaHandle.STATUS;
  showUpdateOption: boolean = false;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private appNotification: AppNotification,
    private dataCardService: DataCardService,
    private renderer: Renderer
  ) {
    document.body.addEventListener("click", e => {
      let target = e.target;
      if (!this.hasClass(target, "download_list")) {
        this.showUpdateOption = false;
      }
    });
  }
  private hasClass(el: any, name: string) {
    if (!el || !el.className) {
      return false;
    }
    if (el.className) {
      return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }
    return false;
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      let id = params["id"];
      if (id) {
        // console.log(id);
        this.initDataSet(id);
      } else {
        this.appNotification.error("参数错误!");
      }
      this.tab = params["tab"];
    });
  }

  initDataSet(dataSetID) {
    //获取基本信息
    this.dataCardService.getById(dataSetID).subscribe(
      response => {
        // console.log(response.data);
        this.dataSet = response.data;
        // this.dataSet.clearSelectedTablesDataSourceID();
      },
      error => {
        this.appNotification.error("数据集获取异常:!");
      }
    );
  }

  ngAfterViewInit() {
    computeMinHeight.setMinHeight(this.renderer, this.dataSetBox.nativeElement);
  }

  delete(dataSetID) {
    this.dataCardService.delete(dataSetID).subscribe(
      () => {
        this.router.navigate(["/chang/data-center/list/set"]);
      },
      (error) => {
        this.appNotification.error(error.errorMsg);
      }
    );
  }

  showSchameComputeLayer(e: MouseEvent, b: boolean) {
    if (!b) {
      this.computeSchame.show();
    }
  }
  cancelSchameCompute(e: MouseEvent) {
    this.computeSchame.hide();
  }
  saveSchameCompute(e: MouseEvent) {
    this.schameLayerFlag = true;
    this.computeSchame.hide();

    this.dataSet.schemaHandle.status = SchemaHandle.STATUS.BUILDING;
    this.dataSet.schemaHandle.completePercent = 1;
  }

  schemaHandleClick() {
    let handle = this.dataSet.schemaHandle;
    if (handle.status == SchemaHandle.STATUS.READY_FOR_BUILD) {
      this.computeSchame.show();
    }
  }

  //是否显示小叹号
  private showMiniWarn: boolean = false;

  //隐藏警告信息,展示小叹号
  hiddenWarnDesc(e: any) {
    this.showMiniWarn = true;
  }

  showWarnDesc() {
    this.showMiniWarn = false;
  }

  showOption(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    // console.log("showUpdateOption:", this.showUpdateOption);
    this.showUpdateOption = this.showUpdateOption ? false : true;
  }

  @ViewChild("schemaHandle")
  schemaHandle: SchemaHandleComponent;
  stopTimer() {
    // console.log("stopTimer");
    this.schemaHandle.stop();
  }

  // refreshCache(dataSetID: string) {
  //   this.dataCardService.updateCache(dataSetID).subscribe(
  //     () => {
  //       this.appNotification.success("更新缓存成功!");
  //     },
  //     (error: Error) => {
  //       this.appNotification.error(error.errMsg);
  //     }
  //   );
  // }
}
