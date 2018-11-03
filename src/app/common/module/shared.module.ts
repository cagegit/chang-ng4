import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FocusChangeStyleDirective } from "./focus-change-style.directive";
import { ScrollBarDirective } from "./scrollbar.directive";
import { MyEditerComponent } from "./my-editer.component";
import { D3ChartComponent } from "../../module/card/d3chart.component";
import { ShowTableComponent } from "../../module/card/card.showTable.component";
import { ConfirmComponent } from "../../module/common/confirm.component";
import { ShowTxtComponent } from "../../module/card/card.showTxt.component";
import { FileUploadModule } from "ng2-file-upload";
import { DrilldownComponent } from "../../module/card/drilldown.component";
import { SectionDimensionComponent } from "../../module/card/section-dimension.component";
import { ChartHighChartModule } from "../../chart/chart.highchart.module";
import { CrumbsComponent } from "./crumbs.component";
import { ModalModule, PaginationModule, TypeaheadModule,TooltipModule } from "ngx-bootstrap";
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
    NoContentModule,
    FileUploadModule
  ],
  declarations: [
    FocusChangeStyleDirective,
    MyEditerComponent,
    ScrollBarDirective,
    ShowTableComponent,
    D3ChartComponent,
    ShowTxtComponent,
    ConfirmComponent,
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
    DrilldownComponent,
    SectionDimensionComponent,
    ChartHighChartModule,
    CrumbsComponent,
    NoContentModule,
    FileUploadModule
  ]
  // ,entryComponents:[ShowTableComponent,D3ChartComponent]
})
export class SharedModule { }
