/**
 * Created by fengjj on 2017/3/31.
 */
import { Component ,Input ,ViewChild ,ElementRef,EventEmitter,Output,Renderer,OnInit} from '@angular/core'
import { Page,Panel} from "../../common/model/dashboard.model";
@Component({
  selector:'set-operate',
  templateUrl:'./set-operate.component.html',
  styleUrls:['./set-operate.component.css']
})
export class SetOperateComponent implements OnInit{

  @Input() top:number;
  @Input() left:number;
  @Input() page:Page;
  @Input() panel:Panel;
  @Input() queryType:string;
  @Output() setOptionEvent=new EventEmitter<any>();
  @Output() refreshPanelEvent=new EventEmitter<any>();
  @ViewChild('opt_drill') opt_drill:ElementRef;
  @ViewChild('opt_section') opt_section:ElementRef;
  drill:boolean;
  section:boolean;
  constructor(private renderer:Renderer){

  }
  ngOnInit():void {
    if(this.panel['drill']&&this.opt_drill){
      this.renderer.setElementClass(this.opt_drill.nativeElement,'cur',true);
    }
    if(this.panel['section']&&this.opt_section){
      this.renderer.setElementClass(this.opt_section.nativeElement,'cur',true);
    }
  }
  setOptionType(type:string){
    if(type=='drill'){
      this.drill=this.panel['drill']?false:true;
      this.section=false;
    }else if(type=='section'){
      this.drill=false;
      this.section=this.panel['section']?false:true;
    }
    this.setOptionEvent.emit({optionType:{drill:this.drill,section:this.section},panelId:this.panel.panelID});
  }
  refresh(){
    this.refreshPanelEvent.emit(this.panel.panelID);
  }
}
