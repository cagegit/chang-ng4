
import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import {NoContentComponent} from "../../no-content";

@NgModule({
    imports:[CommonModule],
    declarations: [NoContentComponent],
    exports:[NoContentComponent]
  })
export class NoContentModule { }
