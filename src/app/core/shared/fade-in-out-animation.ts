import {
  animate,
  query,
  sequence,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const inOutAnimation = trigger('inOutAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('0.5s ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('0.2s ease-in', style({ opacity: 0 })),
  ]),
]);

export const listAnimationDesktop = trigger('listAnimationDesktop', [
  transition('void => *', [
    style({
      height: '*',
      opacity: '0',
      transform: 'translateX(-550px)',
      'box-shadow': 'none',
    }),
    sequence([
      animate(
        '.35s ease',
        style({
          height: '*',
          opacity: '.2',
          transform: 'translateX(0)',
          'box-shadow': 'none',
        })
      ),
      animate(
        '.35s ease',
        style({ height: '*', opacity: 1, transform: 'translateX(0)' })
      ),
    ]),
  ]),
]);
