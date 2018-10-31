
import { Component ,ElementRef,ViewChild ,Renderer ,AfterViewInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AppState} from "../app.service";
import {AppContext} from "../common/AppContext";
import { computeMinHeight } from '../common/service/compute-min-height';

@Component({
  templateUrl:'./main.component.html',
  styleUrls:['./main.component.css']
})
export class MainComponent implements AfterViewInit{
  @ViewChild('appMainBox') appMainBox:ElementRef;
  constructor(private renderer:Renderer) {

  }
  ngAfterViewInit() {
    computeMinHeight.setMinHeight(this.renderer,this.appMainBox.nativeElement);
  }
}
