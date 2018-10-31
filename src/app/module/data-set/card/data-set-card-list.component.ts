import {
  Component,
  Input,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  ElementRef
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CardService } from "../../../common/service/card.service";
import { AppNotification } from "../../../app.notification";
import { DataSet } from "../../../common/model/data-set.model";
import { SchemaHandle } from "../../../common/model/schema-handle.model";
import { DataSetAlertComponent } from "../data-set-alert.component";
import { ConfirmComponent } from "../../common/confirm.component";
import { Card } from "../../../common/model/card/card.model";
import { DataCardService } from "../data-card.service";

@Component({
  selector: "data-set-card-list",
  templateUrl: "./data-set-card-list.component.html",
  styleUrls: ["./data-set-card-list.component.css"]
})
export class DataSetCardListComponent {
  nextText = `<i class="iconfont icon-jiantou-copy"></i>`;
  previousText = `<i class="iconfont icon-jiantouy-copy"></i>`;
  cards: Card[] = new Array<Card>();
  @Input()
  dataSet;
  dataSetId: string;
  bigTotalItems: number;
  itemsPerPage: number = 15;
  bigCurrentPage: number = 1;
  pageCards: Card[] = new Array<Card>();
  cardWidth: number;
  // @ViewChild('dataSetAlert') dataSetAlert:ModalDirective;
  @ViewChild("dataSetAlert")
  dataSetAlert: DataSetAlertComponent;
  @ViewChild("alertConfirm")
  alertConfirm: ConfirmComponent;
  @ViewChild("listBox")
  listBox: ElementRef;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private appNotification: AppNotification,
    private cardService: CardService,
    private dataCardService: DataCardService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // let simpleChange = changes["dataSet"];
    // if (simpleChange && !simpleChange.isFirstChange()) {
    //   this.dataSet = simpleChange.currentValue as DataSet;
    //   this.dataSet = DataSet.build(this.dataSet);
    //   this.initPage();
    // }
  }

  ngAfterViewInit() {
    let oLi = this.listBox.nativeElement.getElementsByTagName(
      "li"
    )[0] as HTMLLIElement;
    let temp: number = oLi.getBoundingClientRect().width - 15 * 2;
    // this.cardWidth = temp;
  }

  ngOnInit() {
    // console.log(this.dataSet);
    this.route.params.subscribe(params => {
      let id = params["id"];
      this.getCards(id, this.bigCurrentPage);
    });
  }

  initPage() {}

  getCards(dataSetId, pageNum) {
    this.dataCardService
      .getCards(dataSetId, pageNum, this.itemsPerPage)
      .subscribe(rep => {
        if (rep && rep.data && Array.isArray(rep.data.list)) {
          this.cards = rep.data.list;
          let firstCard = new Card();
          firstCard.cardName = "";
          this.cards.unshift(firstCard);
          this.bigTotalItems = rep.data.total;
          this.cards.forEach(card => {
            switch (card.renderMode) {
              case "singleVerticalBar":
                card["img"] = "assets/img/bar-vertical-big.png";
                break;
              case "singleHorizontalBar":
                card["img"] = "assets/img/bar-horizontal-big.png";
                break;
              case "bar":
                card["img"] = "assets/img/bar-vertical-2d-big.png";
                break;
              case "groupHorizontalBar":
                card["img"] = "assets/img/bar-horizontal-2d-big.png";
                break;
              case "verticalStackedBar":
                card["img"] = "assets/img/bar-vertical-stacked-big.png";
                break;
              case "horizontalStackedBar":
                card["img"] = "assets/img/bar-horizontal-stacked-big.png";
                break;
              case "line":
                card["img"] = "assets/img/line-big.png";
                break;
              case "area":
                card["img"] = "assets/img/area-big.png";
                break;
              case "stackedArea":
                card["img"] = "assets/img/area-stacked-big.png";
                break;
              case "pie":
                card["img"] = "assets/img/pie-big.png";
                break;
              case "table":
                card["img"] = "assets/img/table-big.png";
                break;
              case "txt":
                card["img"] = "assets/img/txt-big.png";
                break;
              default:
                card["img"] = "assets/img/d3_img.jpg";
                break;
            }
          });
          this.pageCards = this.cards;
          // this.getPageCards();
        }
      });
  }

  // getPageCards(){
  //   this.pageCards.splice(0,this.pageCards.length);
  //   let startIndex= this.itemsPerPage*(this.bigCurrentPage-1);
  //   let endIndex=this.itemsPerPage*this.bigCurrentPage;
  //   this.cards.forEach((card,i)=>{
  //     if(startIndex<=i&&i<endIndex) {
  //       this.pageCards.push(card);
  //     }
  //   })
  // }

  pageChanged(e: any) {
    this.bigCurrentPage = e.page;
    this.getCards(this.dataSet.dataSetID, this.bigCurrentPage);
  }

  openConfirmFn(cardId) {
    this.alertConfirm.open("确定", "确定要删除该数据集吗？", cardId);
  }

  delCard(cardId) {
    this.dataCardService.delCard(cardId).subscribe(rep => {
      let index = this.cards.findIndex(c => {
        if (c.cardId == cardId) return true;
      });
      this.cards.splice(index, 1);
      // this.getPageCards();
    });
  }

  //新建报表
  gotoCard(needConfirm: boolean, cardID?: string) {
    if (
      needConfirm &&
      this.dataSet.schemaHandle &&
      this.dataSet.schemaHandle.status == SchemaHandle.STATUS.READY_FOR_BUILD
    ) {
      this.dataSetAlert.alert(cardID);
      return;
    } else {
      if (!cardID) {
        // console.log(Array.isArray(this.dataSet.dataSourceList));
        //创建
         if (this.dataSet.dataSourceList && this.dataSet.dataSourceList.length===1) {
          this.router.navigate(['/card/OLAP',{ id: this.dataSet.dataSetID }]);
        } else{
          this.appNotification.error('暂不支持两个数据源下创建报表');
        }
        // if (
        //   this.dataSet.dataSourceList &&
        //   this.dataSet.dataSourceList.length > 1
        // ) {
        //   //数据源多于一个
        //   console.log("sql");
        //   this.router.navigate([
        //     "/chang/card",
        //     "SQL",
        //     { id: this.dataSet.dataSetID }
        //   ]);
        // } else {
        //   console.log("olap");
        //   this.router.navigate([
        //     "/chang/card",
        //     "OLAP",
        //     { id: this.dataSet.dataSetID }
        //   ]);
        // }
      } else {
        //编辑
        // let card = this.cards.filter(c => {
        //   if (c.cardId == cardID) {
        //     return;
        //   }
        // });
        this.router.navigate(['/card/OLAP',{ id: this.dataSet.dataSetID, cardId: cardID }]);
        // if (
        //   card[0].queryType == "SQL" ||
        //   (this.dataSet.dataSourceList &&
        //     this.dataSet.dataSourceList.length > 1)
        // ) {
        //   this.router.navigate([
        //     "/card",
        //     "SQL",
        //     { id: this.dataSet.dataSetID, cardId: cardID }
        //   ]);
        // } else {
        //   this.router.navigate([
        //     "/card",
        //     "OLAP",
        //     { id: this.dataSet.dataSetID, cardId: cardID }
        //   ]);
        // }
      }
    }
  }
}
