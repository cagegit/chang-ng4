import {Component, OnInit, ViewChild, EventEmitter, Output} from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";
import {AppNotification} from "../../../app.notification";
import {FileUploader, ParsedResponseHeaders} from "ng2-file-upload/ng2-file-upload";
import {CFG} from "../../../common/CFG";
@Component({
  selector:'manifest-upload',
  templateUrl: './manifest-upload.component.html',
  styleUrls: ['./manifest-upload.component.css']
})
export class ManifestUploadComponent implements OnInit {
  @ViewChild('manifestUploadModal') manifestUploadModal:ModalDirective;
  @Output() closeChange = new EventEmitter();
  uploader:FileUploader;
  constructor(private appNotification : AppNotification){

  }

  ngOnInit() {
    this.uploader=new FileUploader({
      url: CFG.API.MANIFEST+'/upload',
      // url : 'http://datasee.csdn.net/csdn-das-usermgt/0.0.5/users/avatar',
      autoUpload: false,
      allowedMimeType: ['text/plain'],
      maxFileSize: 5*1024*1024 // 5 MB
    });
    this.uploader.cancelAll();
    this.uploader.clearQueue();
    let self=this;
    this.uploader.onErrorItem=function(item: any, response: string, status: number, headers: ParsedResponseHeaders){
      self.appNotification.error('上传失败!');
      console.error("用户头像上传失败",item,response,status,headers);
    }
    this.uploader.onSuccessItem=function(item: any, response: string, status: number, headers: ParsedResponseHeaders){
      self.appNotification.success('上传成功!');
      setTimeout(()=>{
        self.closeHandle();
      },1000);
    }
  }

  ok(){
    this.uploader.uploadAll();
  }


  ngAfterViewInit() {
    this.manifestUploadModal.show();
  }
  closeHandle() {
    this.manifestUploadModal.hide();
    this.closeChange.emit(true);
  }
}
