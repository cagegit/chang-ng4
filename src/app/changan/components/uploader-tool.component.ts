import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import { FileUploader } from "ng2-file-upload";
import {AppNotification} from "../../app.notification";
const UploaderEnum ={
  "success": "上传成功",
  "active": "上传中...",
  "exception": "上传失败"
};
@Component({
  selector: "app-uploader-tool",
  templateUrl: "./uploader-tool.component.html",
  styleUrls: ["./uploader-tool.component.scss"]
})
export class UploaderToolComponent implements OnInit, OnChanges {
  @Input()
  url: string = "";
  @Input() start:Date = null;
  @Input() end:Date = null;
  @Input() isTime =false;
  @Output()
  success: EventEmitter<object> = new EventEmitter<object>();
  @Output()
  fail: EventEmitter<object> = new EventEmitter<object>();
  @Output()
  uploading: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('upload') uploadInput: ElementRef;
  @ViewChild('resetBtn') resetBtn: ElementRef;
  private static  MaxSize = 1048576; // 默认上传1M
  private static  MimeType = 'xls';
  fileName ='';
  upStatus = 'active';
  upProcess = 0;
  // fileSize = 0;
  UpZf = UploaderEnum;
  public uploader:FileUploader;
  constructor(private appNotification: AppNotification) { }

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if(changes['start'] && changes['end']) {
        this.start = changes['start'].currentValue;
        this.end = changes['end'].currentValue;
    }
    if(changes["url"] && changes["url"].currentValue) {
      const currentUrl = changes["url"].currentValue;
      this.uploader = null;
      if(this.isTime) {
        this.uploader = new FileUploader({
          url: currentUrl,
          method: "POST",
          itemAlias: "file",
          autoUpload: true,
          maxFileSize: UploaderToolComponent.MaxSize,
          allowedMimeType: ['application/csv', 'text/csv', 'application/vnd.ms-excel']
        });
        this.uploader.onBuildItemForm = (item, form) => {
          form.append('start', (this.start && this.start.getTime()));
          form.append('to', (this.end && this.end.getTime()));
        };
      } else {
        this.uploader = new FileUploader({
          url: currentUrl,
          method: "POST",
          itemAlias: "file",
          autoUpload: true,
          maxFileSize: UploaderToolComponent.MaxSize,
          allowedFileType: ['xls']
        });
      }
      this.uploader.onWhenAddingFileFailed = (item, filter) => {
        if(filter && filter.name==='fileSize') {
          this.appNotification.error('导入文件大小不能超过1M！');
        }
        if(filter && filter.name==='fileType') {
          this.appNotification.error('只允许导入xls类型的文件！');
        }
        if(this.isTime && filter && filter.name==='mimeType') {
          this.appNotification.error('只允许导入csv类型的文件！');
        }
      };
      this.uploader.onSuccessItem = (item:any, response: string, status: number) => {
        if(status === 200) {
          this.upStatus = 'success';
          this.upProcess = 100;
        }
        this.success.emit({ item, response, status });
      };
      this.uploader.onErrorItem = (item, response, status) => {
        this.upStatus = "exception";
        this.fail.emit({ response, status });
      };
      this.uploader.onProgressItem = (fileItem, processNum) => {
        // console.log(processNum);
        this.upStatus = "active";
        this.upProcess = processNum;
        this.uploading.emit(processNum);
      };
    }
  }
  uploadFile(e) {
    this.resetForm();
    if(this.isTime) {
      if(!this.start) {
        this.appNotification.error('开始时间不能为空！');
        return;
      }
      if(!this.end) {
        this.appNotification.error('结束时间不能为空！');
        return;
      }
    }
    this.uploadInput.nativeElement.click();
  }
  // 文件改变
  changeFile(e) {
    if (e && e.target) {
      this.fileName = e.target.value;
    }
  }
  // 重置
  resetForm() {
    this.fileName = "";
    this.resetBtn.nativeElement.click();
  }
}
