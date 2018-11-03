
import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import {NoContentComponent} from "../../no-content";
import { DomMinHeightDirective } from './dom-min-height.directive';
import { ExponentialStrengthPipe } from '../pipe/example.pipe';
import { FormatDatePipe } from '../pipe/format.date.pipe';
import { InterceptlengthPipe } from '../pipe/interceptlength.pipe';
import { LoadingComponent } from '../../module/common/loading.component';

@NgModule({
    imports:[CommonModule],
    declarations: [
      NoContentComponent,
      DomMinHeightDirective,
      ExponentialStrengthPipe,
      FormatDatePipe,
      InterceptlengthPipe,
      LoadingComponent
    ],
    exports:[NoContentComponent]
  })
export class NoContentModule { }
