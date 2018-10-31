/**
 * Created by fengjj on 2017/1/18.
 */
import {Component, Input ,ElementRef ,ViewChild ,AfterViewInit ,Output ,EventEmitter ,Inject} from "@angular/core"

declare var ace:any;
@Component({
  selector : 'my-editor',
  templateUrl:'./my-editor.component.html',
  styleUrls:['./my-editor.component.css']
})
export class MyEditorComponent {
  @ViewChild('editorBox') editorBox:ElementRef;
  @Input() data:string;
  @Input() mode:string;
  @Input() editFlag = true;
  @Input() createFlag = false;
  @Output() resizeEidtorEvent = new EventEmitter();
  folderFlag = false;
  ele:any;
  editor:any;
  constructor(@Inject(ElementRef) elementRef:ElementRef){
    this.ele = elementRef;
  }
  ngAfterViewInit(){
    this.editor = ace.edit(this.editorBox.nativeElement);
    console.log(this.editor);
    this.editor.setTheme("ace/theme/iplastic");
    this.editor.getSession().setMode(`ace/mode/${this.mode}`);
    this.editor.setValue(this.data);
    this.editor.setReadOnly(!this.editFlag);
    this.editor.setShowPrintMargin(this.editFlag);
  }
  resizeEditor(e:MouseEvent){
    let target = <HTMLElement> e.target;
    this.folderFlag = !this.folderFlag;
    this.resizeEidtorEvent.emit({folderFlag:this.folderFlag,ele:this.ele.nativeElement});
    this.editor.resize();
  }

  public insertText(text : string){
    console.log("MyEditorComponent.insertText",text);
   this.editor.insert(text);
  }

  public test(){

  }
}

