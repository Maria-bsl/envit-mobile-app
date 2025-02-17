import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { TranslateConfigService } from 'src/app/translate-config.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import {
  IonLoading,
  IonContent,
  IonText,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';
import { LoadingService } from 'src/app/services/loading-service/loading.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    //IonicModule,
    IonLoading,
    IonContent,
    IonText,
    IonButton,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    TranslateModule,
  ],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  response: any;
  PostData!: FormGroup;
  language: any;
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private service: ServiceService,
    private router: Router,
    private fb: FormBuilder,
    private appConfig: AppConfigService,
    private _unsubscriber: UnsubscriberService,
    private translateConfigService: TranslateConfigService,
    private translate: TranslateService,
    private loadingService: LoadingService,
    private navCtrl: NavController
  ) {
    this.translateConfigService.getDefaultLanguage();
    this.language = this.translateConfigService.getCurrentLang();
    const backButton = () => {
      const backToLogin = () => this.router.navigate(['/login']);
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private createPostDataFormGroup() {
    this.PostData = this.fb.group({
      mobile_number: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[67]\d{8}$/),
      ]),
    });
  }
  ngOnInit() {
    this.createPostDataFormGroup();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  private async forgetpwd(mobileNumber: string) {
    const success = (res: any) => {
      if (res.status == 1) {
        AppUtilities.showSuccessMessage(
          '',
          'Credentials have been sent to your mobile number.'
        );
        this.router.navigate(['login']);
      } else {
        AppUtilities.showErrorMessage('', 'Invalid mobile number');
      }
    };
    const error = (err: any) => {
      this.appConfig.closeLoading(this.ionLoading);
      AppUtilities.showErrorMessage('', 'An error occurred. Please try again.');
      console.error(err);
    };
    this.loadingService
      .startLoading()
      .then((loading) => {
        this.service
          .Forgetpwd(`0${mobileNumber}`)
          .pipe(finalize(() => this.loadingService.dismiss()))
          .subscribe({
            next: (res: any) => success(res),
            error: (err) => error(err),
          });
      })
      .catch((err) => console.error(err));
  }
  loginpage() {
    this.router.navigate(['/login']);
  }
  onResetPasswordClicked() {
    if (this.mobile_number.valid) {
      this.forgetpwd(this.mobile_number.value);
    } else {
      this.mobile_number.markAllAsTouched();
    }
  }
  get mobile_number() {
    return this.PostData.get('mobile_number') as FormControl;
  }
}
