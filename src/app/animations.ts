import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
export const flyIn = trigger('flyIn', [
  state('in', style({ transform: 'translateX(0)' })),
  transition('void => *', [ 
    animate(300, keyframes([
      style({ opacity: 1, transform: 'translateX(-100%)', offset: 0 }),
      style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
    ]))
  ]),
  transition('* => void', [
    animate(300, keyframes([
      style({ opacity: 1, transform: 'translateX(0)', offset: 0 }),
      style({ opacity: 0, transform: 'translateX(100%)', offset: 1.0 })
    ]))
  ])
]);

export const flyInOut = trigger('flyInOut', [
  state('in', style({ transform: 'translateX(0)' })),
  transition('void => *', [
    animate(300, keyframes([
      style({ opacity: 1, transform: 'translateX(150%)', offset: 0 }),
      style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
    ]))
  ]),
  transition('* => void', [
    animate(300, keyframes([
      style({ opacity: 1, transform: 'translateX(0)', offset: 0 }),
      style({ opacity: 0, transform: 'translateX(100%)', offset: 1.0 })
    ]))
  ])
]);
export const dropDown = trigger('dropDown', [
  state('in', style({ height:'300px' })),
  transition('void => *', [ 
    animate(300, keyframes([
      style({ height:'300px' })
    ]))
  ]),
  transition('* => void', [
    animate(300, keyframes([
      style({ height:'45px' })
    ]))
  ])
]);

