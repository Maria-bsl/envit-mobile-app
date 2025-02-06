import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonLoading,
  IonContent,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription, finalize, switchMap, tap } from 'rxjs';
import { TranslateConfigService } from '../../translate-config.service';
import { AppUtilities } from '../../core/utils/AppUtilities';
import { LoginResponse } from '../../core/responses/LoginResponse';
import { ServiceService } from '../../services/service.service';
import { FLoginPayload } from '../../core/forms/f-login-payload';
import { UnsubscriberService } from '../../services/unsubscriber/unsubscriber.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { inOutAnimation } from 'src/app/core/shared/fade-in-out-animation';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule,
    IonLoading,
    IonContent,
    IonText,
    IonButton,
  ],
  animations: [inOutAnimation],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  language: any;
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: ServiceService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private translateConfigService: TranslateConfigService,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private _appConfig: AppConfigService,
    private loadingService: LoadingService
  ) {
    this.registerIcons();
    this.translateConfigService.getDefaultLanguage();
    this.language = this.translateConfigService.getCurrentLang();
    this.createLoginFormGroup();
  }
  private createLoginFormGroup() {
    this.loginForm = this.fb.group({
      mobile_number: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[67]\d{8}$/),
      ]),
      password: this.fb.control('', [Validators.required]),
      ip_address: this.fb.control('', []),
    });
  }
  private registerIcons() {
    this._appConfig.addIcons(['lock', 'eye', 'eye-off'], '/assets/feather/');
  }
  private parseLoginResponse(res: LoginResponse) {
    this._appConfig.addSessionStorageItem(
      AppUtilities.TOKEN_NAME,
      JSON.stringify({ mobile: res.Mobile_Number })
    );
    if (res.event_details && res.event_details.length > 0) {
      this._appConfig.addSessionStorageItem(
        AppUtilities.EVENT_DETAILS_LIST,
        JSON.stringify(res.event_details)
      );
      this.router.navigateByUrl('switch', {
        state: { data: res.event_details },
        replaceUrl: true,
      });
    } else {
      this.translate.get('defaults.errors.failed').subscribe({
        next: (message) => {
          AppUtilities.showErrorMessage(message, res.message ?? '');
          this.router.navigate(['login']);
        },
      });
    }
  }
  onClickLogin() {
    const erroneousRes = async (err: any) => {
      (await this.loadingService.isLoading()) && this.loadingService.dismiss();
      this.translate
        .get('loginPage.loginForm.errors.loginFailed')
        .pipe(this._unsubscriber.takeUntilDestroy)
        .subscribe({
          next: (message) => {
            AppUtilities.showErrorMessage('', err.error.message);
            this.router.navigate(['/login']);
          },
        });
    };
    const login = () => {
      return this.service.loginFunc({
        ...this.loginForm.value,
        mobile_number: '0' + this.mobile_number.value,
      } as FLoginPayload);
    };
    if (this.loginForm.valid) {
      this.loadingService
        .startLoading()
        .then((loading) => {
          login()
            .pipe(
              this._unsubscriber.takeUntilDestroy,
              finalize(() => this.loadingService.dismiss())
            )
            .subscribe({
              next: (res) => this.parseLoginResponse(res),
              error: (err) => erroneousRes(err),
            });
        })
        .catch((err) => console.error(err));
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  resetPage() {
    this.router.navigate(['recoverpwd']);
  }
  tryEvent() {
    this.router.navigate(['pricing']);
  }
  ngOnInit() {
    this._appConfig.clearSessionStorage();
  }
  get mobile_number() {
    return this.loginForm.get('mobile_number') as FormControl;
  }
  get password() {
    return this.loginForm.get('password') as FormControl;
  }
  get ip_address() {
    return this.loginForm.get('ip_address') as FormControl;
  }
}
