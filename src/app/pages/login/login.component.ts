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
import { Subscription, finalize } from 'rxjs';
import { TranslateConfigService } from '../../translate-config.service';
import { EventDetailsResponse } from '../../core/interfaces/EventDetailsResponse';
import { AppUtilities } from '../../core/utils/AppUtilities';
import { LoginResponse } from '../../core/interfaces/LoginResponse';
import { ServiceService } from '../../services/service.service';
import { LoginPayload } from '../../core/interfaces/login-payload';
import { UnsubscriberService } from '../../services/unsubscriber/unsubscriber.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';

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
})
export class LoginComponent implements OnInit, OnDestroy, AfterContentInit {
  loginForm!: FormGroup;
  subscriptions: Subscription[] = [];
  language: any;
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private dialog: MatDialog,
    private router: Router,
    private service: ServiceService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private translateConfigService: TranslateConfigService,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private appConfig: AppConfigService
  ) {
    this.registerIcons(iconRegistry, sanitizer);
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
  private registerIcons(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'lock',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/feather/lock.svg')
    );
  }
  private parseLoginResponse(res: LoginResponse) {
    localStorage.setItem(
      AppUtilities.TOKEN_NAME,
      JSON.stringify({ mobile: res.Mobile_Number })
    );
    if (res.event_details && res.event_details.length > 0) {
      localStorage.setItem(
        'event_details_list',
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
    if (this.loginForm.valid) {
      let form = {
        ...this.loginForm.value,
        mobile_number: '0' + this.mobile_number.value,
      } as LoginPayload;
      this.appConfig
        .startLoading(this.ionLoading)
        .pipe(this._unsubscriber.takeUntilDestroy)
        .subscribe({
          next: () => {
            this.service
              .loginFunc(form)
              .pipe(
                this._unsubscriber.takeUntilDestroy,
                finalize(() => this.appConfig.closeLoading(this.ionLoading))
              )
              .subscribe({
                next: (res: any) => {
                  this.parseLoginResponse(res);
                },
                error: (err) => {
                  this.appConfig.closeLoading(this.ionLoading);
                  this.translate
                    .get('loginPage.loginForm.errors.loginFailed')
                    .pipe(this._unsubscriber.takeUntilDestroy)
                    .subscribe({
                      next: (message) => {
                        AppUtilities.showErrorMessage(
                          message,
                          err.error.message
                        );
                        this.router.navigate(['login']);
                      },
                    });
                },
              });
          },
        });
      // AppUtilities.startLoading(this.loadingCtrl)
      //   .then((loading) => {
      //     this.service
      //       .loginFunc(form)
      //       .pipe(
      //         this._unsubscriber.takeUntilDestroy,
      //         finalize(() => loading.dismiss())
      //       )
      //       .subscribe({
      //         next: (res: any) => {
      //           this.parseLoginResponse(res);
      //         },
      //         error: (err) => {
      //           loading.dismiss();
      //           this.translate
      //             .get('loginPage.loginForm.errors.loginFailed')
      //             .pipe(this._unsubscriber.takeUntilDestroy)
      //             .subscribe({
      //               next: (message) => {
      //                 AppUtilities.showErrorMessage(message, err.error.message);
      //                 this.router.navigate(['login']);
      //               },
      //             });
      //         },
      //       });
      //   })
      //   .catch((err) => {
      //     throw err;
      //   });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // openDialog(eventDetails: EventDetailsResponse[]) {
  //   const dialogRef = this.dialog.open(EventselectionPage, {
  //     data: eventDetails,
  //     disableClose: true,
  //   });
  // }
  resetpage() {
    this.router.navigate(['recoverpwd']);
  }
  tryevent() {
    this.router.navigate(['pricing']);
  }
  ngOnInit() {
    localStorage.clear();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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
