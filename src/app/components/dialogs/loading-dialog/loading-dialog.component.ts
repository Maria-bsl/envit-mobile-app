import { AfterViewInit, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.scss',
})
export class LoadingDialogComponent {
  constructor() {}
}
