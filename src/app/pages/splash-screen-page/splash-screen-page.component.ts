import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { TranslateConfigService } from 'src/app/translate-config.service';

@Component({
  selector: 'app-splash-screen-page',
  templateUrl: './splash-screen-page.component.html',
  styleUrls: ['./splash-screen-page.component.scss'],
  standalone: true,
  imports: [IonContent, MatButtonModule, MatIconModule],
})
export class SplashScreenPageComponent implements OnInit {
  formGroup!: FormGroup;
  languages = ['en', 'sw'];
  constructor(
    private _appConfig: AppConfigService,
    private translateConfigService: TranslateConfigService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    let icons: any[] = [['gb', 'tz'], 'assets/icon'];
    this._appConfig.addIcons(icons[0], icons[1]);
  }
  ngOnInit() {}
  submit(event: MouseEvent, code: string) {
    if (this.translateConfigService.getCurrentLang() !== code) {
      localStorage.setItem('currentLang', code);
      this.translateConfigService.setLanguage(code);
      this.loadingService.startLoading().then((loading) => {
        setTimeout(() => {
          this.loadingService.dismiss();
          this.router.navigate(['login']);
        }, 1000);
      });
    }
  }
}
