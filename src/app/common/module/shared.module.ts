import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TooltipModule } from "ng2-bootstrap";
import { FocusChangeStyleDirective } from "./focus-change-style.directive";
import { ScrollBarDirective } from "./scrollbar.directive";
import { MyEditerComponent } from "./my-editer.component";
import { D3ChartComponent } from "../../module/card/d3chart.component";
import { ShowTableComponent } from "../../module/card/card.showTable.component";
import { ConfirmComponent } from "../../module/common/confirm.component";
import { ShowTxtComponent } from "../../module/card/card.showTxt.component";
import { FileSelectDirective } from "ng2-file-upload/ng2-file-upload";
import { DrilldownComponent } from "../../module/card/drilldown.component";
import { SectionDimensionComponent } from "../../module/card/section-dimension.component";
import ChartHighChartModule from "../../chart/chart.highchart.module";
import { CrumbsComponent } from "./crumbs.component";
import { ModalModule, PaginationModule, TypeaheadModule } from "ng2-bootstrap";
// import {NoContentComponent} from "../../no-content/no-content.component";
import { NoContentModule } from "./no-content.module";
//第三方

/** custom directive**/
//属性指令　获取焦点改变某元素的显示效果
//组件
@NgModule({
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TypeaheadModule.forRoot(),
    ChartHighChartModule,
    FormsModule,
    ReactiveFormsModule,
    NoContentModule],
  declarations: [
    FocusChangeStyleDirective,
    MyEditerComponent,
    ScrollBarDirective,
    ShowTableComponent,
    D3ChartComponent,
    ShowTxtComponent,
    ConfirmComponent,
    FileSelectDirective,
    DrilldownComponent,
    SectionDimensionComponent,
    CrumbsComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FocusChangeStyleDirective,
    MyEditerComponent,
    ScrollBarDirective,
    ModalModule,
    TooltipModule,
    PaginationModule,
    TypeaheadModule,
    ShowTableComponent,
    D3ChartComponent,
    ShowTxtComponent,
    ConfirmComponent,
    FileSelectDirective,
    DrilldownComponent,
    SectionDimensionComponent,
    ChartHighChartModule,
    CrumbsComponent,
    NoContentModule]
  // ,entryComponents:[ShowTableComponent,D3ChartComponent]
})
export class SharedModule { }
