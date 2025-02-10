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
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
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
import {
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  catchError,
  concatMap,
  finalize,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { TranslateConfigService } from '../../translate-config.service';
import { AppUtilities } from '../../core/utils/AppUtilities';
import {
  EventDetailsResponse,
  LoginResponse,
} from '../../core/responses/LoginResponse';
import { ServiceService } from '../../services/service.service';
import { FLoginPayload } from '../../core/forms/f-login-payload';
import { UnsubscriberService } from '../../services/unsubscriber/unsubscriber.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
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
  providers: [TranslatePipe],
  animations: [inOutAnimation],
})
export class LoginComponent {
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
    private loadingService: LoadingService,
    private _trPipe: TranslatePipe
  ) {
    const backButton = () => {
      const backToLogin = () => new Promise<void>((r, j) => r());
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
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
    const icons = ['lock', 'eye', 'eye-off'];
    this._appConfig.addIcons(icons, '/assets/feather');
  }
  signUserIn(event: Event) {
    const login = (): Observable<LoginResponse> => {
      return this.service.loginFunc({
        ...this.loginForm.value,
        mobile_number: `0${this.mobile_number.value}`,
      } as FLoginPayload);
    };
    const erroneousRes = async (err: any) => {
      switch (err.error.message.toLocaleLowerCase()) {
        case 'Invalid mobile number or password'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform(
              'loginPage.loginForm.errors.invalidUsernameOrPassword'
            )
          );
          this.router.navigate(['/login']);
          break;
        default:
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform(
              'loginPage.loginForm.errors.loginFailedContactSupport'
            )
          );
          break;
      }
    };
    const authorizeUser = (
      mobileNumber: string,
      eventDetails: EventDetailsResponse[]
    ) => {
      this._appConfig.addSessionStorageItem(
        AppUtilities.TOKEN_NAME,
        JSON.stringify({ mobile: mobileNumber })
      );
      this._appConfig.addSessionStorageItem(
        AppUtilities.EVENT_DETAILS_LIST,
        JSON.stringify(eventDetails)
      );
      this.router.navigate(['/switch'], {
        state: { data: eventDetails },
        replaceUrl: true,
      });
    };
    const parseLogin = (res: void | LoginResponse) => {
      if (res && res.event_details) {
        authorizeUser(res.Mobile_Number, res.event_details);
      } else {
        const title = this._trPipe.transform('defaults.errors.failed');
        const message = this._trPipe.transform(
          'loginPage.loginForm.errors.loginFailedContactSupport'
        );
        AppUtilities.showErrorMessage(title, message);
      }
    };
    this.loadingService
      .beginLoading()
      .pipe(
        this._unsubscriber.takeUntilDestroy,
        mergeMap((loading) =>
          login().pipe(
            this._unsubscriber.takeUntilDestroy,
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err)),
            filterNotNull()
          )
        )
      )
      .subscribe(parseLogin);
  }
  resetPage() {
    this.router.navigate(['recoverpwd']);
  }
  tryEvent() {
    this.router.navigate(['pricing']);
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
