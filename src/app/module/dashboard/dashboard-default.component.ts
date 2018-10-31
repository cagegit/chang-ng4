import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataHandleService } from '../../changan/data.handle.service';

@Component({
  selector: 'app-dashboard-default-com',
  styles: [],
  template: ``,
})
export class DashboardDefaultComponent{

   constructor(private router: Router,private dataHandleSer:DataHandleService) {
     this.dataHandleSer.dashboardIdSubject$.subscribe((id) => {
       if(id) {
         this.router.navigate(['/dashboard/info/'+id]);
       }
     });
   }
}
