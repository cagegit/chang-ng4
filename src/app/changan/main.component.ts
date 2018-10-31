import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'chang-main',
  templateUrl:'./main.component.html',
  styleUrls: ['./main.component.scss']
})
export class ChangMainComponent {

  currentTab = 0;
  constructor(private router:Router) {

  }

  changeRoute(num) {
    this.currentTab = num;
    switch (num) {
      case 0:
        this.router.navigate(['car/tasks']);
        break;
      case 1:
        this.router.navigate(['car/transmit']);
        break;
      case 2:
        this.router.navigate(['car/setting']);
        break;
      case 3:
        this.router.navigate(['car/log']);
        break;
      default:
        this.router.navigate(['car/tasks']);
    }

  }
}
