/**
 * Created by fengjj on 2017/1/5.
 */
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DashboardService } from "../../common/service/dashboard.service";
import { Dashboard } from "../../common/model/dashboard.model";
import { CardService } from "../../common/service/card.service";
import { flyIn } from "../../animations";
import { DataHandleService } from '../../changan/data.handle.service';
@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard-preview.component.html',
  styleUrls: [
    './dashboard-preview.component.css'
  ],
  animations: [flyIn]
})

export class DashboardPreviewComponent implements OnInit {
  dashboard: Dashboard = new Dashboard();
  isPreview = true;
  id: string;
  noContentStyle = { width: 500, height: 200 };
  constructor(private router: Router, private route: ActivatedRoute, private dashboardService: DashboardService, private cardService: CardService,
              private dataHandleSer: DataHandleService) {
  }


  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.id = params['id'];
      //this.isTemplate = false;
      this.dataHandleSer.getDashboardById(params['id']).subscribe((res: any) => {
        if(res && res.data) {
          this.dashboard = Dashboard.build(res.data);
        }

      }, (error) => {
        if (error.errCode == 404) {
          this.router.navigate(['/error'])
        }
      })
    });

  }
}
