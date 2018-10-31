import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Renderer,
  AfterViewInit
} from "@angular/core";
import { flyIn } from "../../animations";
import { computeMinHeight } from "../../common/service/compute-min-height";

@Component({
  templateUrl: "./data-fullpage.component.html",
  styleUrls: ["./data-center.component.scss"],
  animations: [flyIn]
})
export class DataFullPageComponent implements AfterViewInit {
  @ViewChild("fullpage")
  fullpage: ElementRef;
  constructor(private renderer: Renderer) {}
  ngAfterViewInit() {
    computeMinHeight.setMinHeight(
      this.renderer,
      this.fullpage.nativeElement,
      true
    );
  }
}
