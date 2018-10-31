import {Component, OnInit, ViewChild, Output,EventEmitter} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";
import {AppNotification} from "../../../app.notification";
import {ManifestService} from "../../../common/service/manifest.service";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {Manifest} from "../../../common/model/manifest.model";
import {Error} from "../../../common/model/Error"
@Component({
  selector:'manifest-add',
  templateUrl: './manifest-add.component.html',
  styleUrls: ['./manifest-add.component.css']
})
export class ManifestAddComponent implements OnInit {
  @ViewChild('manifestAddModal') manifestAddModal:ModalDirective;
  @Output() closeChange = new EventEmitter();
  submitted = false;
  manifestForm: FormGroup;
  manifest : Manifest=new Manifest();
  inputBranches : string;
  constructor(private appNotification : AppNotification,private formBuilder:FormBuilder,private manifestService : ManifestService){

  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.manifest.allBranchFlag=1;
    this.manifestForm = this.formBuilder.group({
      'project' : [this.manifest.project, [
        Validators.required
      ]],
      'organization' : [this.manifest.organization, [
        Validators.required
      ]],
      'url': [this.manifest.url, [
        Validators.required
      ]],
      'allBranchFlag' :[Manifest.ALL_BRANCH_FLAG.ALL, [
        Validators.required
      ]],
      'inputBranches' :[''],
    });
    this.manifestForm.valueChanges
      .subscribe(data => this.onValueChanged(this.manifestForm,data));
    this.onValueChanged(this.manifestForm);
  }

  formErrors = {
    'project':'',
    'organization': '',
    'url': ''
  };

  validationMessages = {
    'project' : {
      'required': '项目名不能为空'
    },
    'organization': {
      'required':  '组织名不能为空',
    },
    'url': {
      'isURL' : '请输入合法的项目链接地址',
      'required': '项目链接地址不能为空'
    }
  };
  onValueChanged(form : FormGroup,data?: any) {
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          console.warn("错误消息:",messages[key]);
          this.formErrors[field] = messages[key];
        }
      }
    }
  }

  formSubmit(){
    this.submitted = true
    if(this.manifestForm.value.allBranchFlag==Manifest.ALL_BRANCH_FLAG.SELECT){
      this.manifest.branches=this.manifestForm.value.inputBranches.split(";");
    }else{
      this.manifest.branches=[];
    }
    this.manifest=Object.assign(this.manifest,this.manifestForm.value);
    this.manifestService.save(this.manifest).subscribe((manifest : Manifest)=>{
      this.appNotification.success("添加成功!");
      setTimeout(()=>{
        this.closeHandle(true);
      },1000);
    },(error : Error)=>{
      this.appNotification.error(error.errMsg);
    });
    this.submitted = false;
  }


  show(){
    this.manifestAddModal.show();
  }

  ngAfterViewInit() {
    this.manifestAddModal.show();
  }
  closeHandle(refresh:boolean=false) {
    this.manifestAddModal.hide();
    this.closeChange.emit(refresh);
  }
}
