import { Component } from '@angular/core';

@Component({
  selector: 'layout-fullscreen',
  template: `<router-outlet></router-outlet><app-notification></app-notification>`
})
export class LayoutFullScreenComponent {
   constructor() {

   }
}
