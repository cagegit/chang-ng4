import {Component, OnInit ,ViewChild ,AfterViewInit,AfterContentInit,ElementRef,Renderer} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import "rxjs/add/operator/map";
import {TenantService} from "./TenantService";
import {Response} from "@angular/http";
import {Tenant} from "../common/model/Tenant";
import {DomainFactory} from "../common/DomainFactory";
import { computeMinHeight } from '../common/service/compute-min-height'

@Component({
  templateUrl : 'TenantComponent.html',
  styleUrls:['./TenantComponent.css'],
  providers:  [ TenantService ]
})
export class TenantComponent implements OnInit ,AfterViewInit{
  public tenant : Tenant;
  @ViewChild('tenantBox') tenantBox:ElementRef;
  constructor(private route: ActivatedRoute,private umTenantService : TenantService,private renderer:Renderer) {
    this.umTenantService.initTenantInfo().toPromise().then((response : Response)=>{
      this.tenant=DomainFactory.buildTenant(response.json());
      console.log("获取租户信息:",JSON.stringify(this.tenant));
    }).catch((response : Response)=>{
      let message=DomainFactory.buildError(response.json()).errMsg;
    });
  }

  /**
   * 初始化组件数据
   */
  ngOnInit():void {
    console.info("ngOnInit");
  }
  ngAfterContentInit() {
    console.log('content')
  }
  ngAfterViewInit() {
    console.log('after')
    computeMinHeight.setMinHeight(this.renderer,this.tenantBox.nativeElement);
    console.log(document.getElementsByClassName('tenant_box')[0])

    //computeMinHeight.setMinHeight(this.tenantBox.nativeElement);
  }
  /**
   * 修改租户信息
   * @param target
     */
  change(domainPrefix) {
    console.info("回车输入:",domainPrefix);
    // this.umTenantService.updateTenant(domainPrefix).subscribe((data)=>{
    //   console.info("初始化租户信息",data);
    //   //this.tenant.domainPrefix=domainPrefix;
    // });
  }

}
