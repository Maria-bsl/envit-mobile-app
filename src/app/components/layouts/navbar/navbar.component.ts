import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { TranslateConfigService } from 'src/app/translate-config.service';
import { SelectLanguageDialogComponent } from '../../dialogs/select-language-dialog/select-language-dialog.component';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeManagerService } from 'src/app/services/theme-manager/them-manager.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { finalize, from, switchMap, tap, timer, zip } from 'rxjs';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { MatRipple } from '@angular/material/core';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import {
  NavController,
  IonHeader,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    MatMenuModule,
    MatButtonModule,
    RouterModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatRipple,
    IonText,
    IonToolbar,
  ],
})
export class NavbarComponent implements OnInit {
  language: any;
  @Output() languageChanged = new EventEmitter<string>();
  constructor(
    private router: Router,
    //private loadingCtrl: LoadingController,
    private appConfig: AppConfigService,
    private translateConfigService: TranslateConfigService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private themeManager: ThemeManagerService,
    private _snackbar: MatSnackBar,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService,
    private navCtrl: NavController
  ) {
    addIcons({ personCircle });
    this.registerIcons();
    this.translateConfigService.getDefaultLanguage();
    this.language = this.translateConfigService.getCurrentLang();
  }
  private registerIcons() {
    let icons = ['translate', 'lock-fill', 'box-arrow-right', 'person-circle'];
    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `/assets/boostrap-icons/${icon}.svg`
        )
      );
    });
  }
  private changeLanguage(code: string) {
    if (this.language !== code) {
      this.loadingService.startLoading().then((loading) => {
        this.language = code;
        this.translateConfigService.setLanguage(code);
        this.appConfig.addSessionStorageItem('currentLang', code);
        let successMessage$ = this.translate.get(
          'navbar.selectLanguage.successChange'
        );
        let action$ = this.translate.get('defaults.actions.ok');
        let observables = zip(successMessage$, action$);
        observables
          .pipe(
            this._unsubscriber.takeUntilDestroy,
            finalize(() => this.loadingService.dismiss())
          )
          .subscribe({
            next: (results) => {
              let [message, action] = results;
              let snackbar = this._snackbar.open(message, action);
              setTimeout(() => {
                snackbar.dismiss();
              }, 5000);
              this.languageChanged.emit();
            },
          });
      });
    }
  }
  ngOnInit() {}
  changepass() {
    this.navCtrl.navigateRoot('/changepwd');
  }
  switchEvent() {
    this.navCtrl.navigateRoot('/switch');
  }
  openChangeLanguage() {
    let dialogRef = this.dialog.open(SelectLanguageDialogComponent, {
      data: {
        language: this.language,
      },
      disableClose: false,
    });
    dialogRef.componentInstance.languageChange.asObservable().subscribe({
      next: (value) => {
        this.changeLanguage(value.language);
        dialogRef.close();
      },
    });
  }
  logoClicked() {
    if (this.router.url === '/switch') {
    } else {
      this.navCtrl.navigateRoot('/tabs/dashboard');
    }
  }
  logout() {
    this.loadingService.startLoading().then((loading) => {
      this.appConfig.clearSessionStorage();
      setTimeout(() => {
        this.loadingService.dismiss();
        this.router.navigate(['login']).then(() => location.reload());
      }, 800);
    });
  }
}
