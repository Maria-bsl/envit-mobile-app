import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { TranslateConfigService } from 'src/app/translate-config.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
  ],
})
export class ChangePasswordComponent implements OnInit {
  private readonly TOKEN_NAME = 'profanis_auth';
  datas: any;
  mobileNumber: any;
  response: any;
  errMsg: any;
  resp: any;
  msg: any;
  language: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: ServiceService,
    private appConfig: AppConfigService,
    //private loadingCtrl: LoadingController,
    private location: Location,
    private translateConfigService: TranslateConfigService,
    private _unsubscriber: UnsubscriberService,
    private translate: TranslateService
  ) {
    addIcons({ arrowBack });
    this.translateConfigService.getDefaultLanguage();
    this.language = this.translateConfigService.getCurrentLang();
  }
  private getChangePasswordPayload(form: any) {
    let body = new Map();
    body.set('mobile_number', this.mobileNumber);
    body.set('current_password', form.current_password);
    body.set('New_Password', form.New_Password);
    const payload = Array.from(body).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: any });
    return payload;
  }
  postData!: FormGroup;
  ngOnInit() {
    this.datas = localStorage.getItem(this.TOKEN_NAME);
    const convertion = JSON.parse(this.datas);

    this.mobileNumber = convertion.mobile;
    this.createPostDataFormGroup();
    this.appConfig.backButtonPressed();
  }
  private createPostDataFormGroup() {
    this.postData = this.fb.group({
      current_password: this.fb.control('', [Validators.required]),
      Create_Password: this.fb.control('', [
        Validators.required,
        AppUtilities.matchValidator('New_Password', true),
      ]),
      New_Password: this.fb.control('', [
        Validators.required,
        AppUtilities.matchValidator('Create_Password'),
      ]),
    });
  }
  async changPass() {
    if (this.postData.invalid) {
      this.postData.markAllAsTouched();
      return;
    }
    this.appConfig.openLoading().then((loading) => {
      let body = this.getChangePasswordPayload(this.postData.value);
      let native = this.service.ChangePswd(body);
      native
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.response = res;
            this.translate
              .get('changePasswordPage.passwordChangedSuccessfully')
              .subscribe({
                next: (message) => {
                  AppUtilities.showSuccessMessage('', message);
                  let eventId = localStorage.getItem('event_id');
                  if (eventId) {
                    this.router.navigate(['tabs/dashboard']);
                  } else {
                    this.router.navigate(['switch']);
                  }
                },
              });
          },
          error: (err) => {
            AppUtilities.showErrorMessage('', err.error.Message);
          },
        });
    });
  }
  backBtn() {
    this.location.back();
  }
  get current_password() {
    return this.postData.get('current_password') as FormControl;
  }
  get Create_Password() {
    return this.postData.get('Create_Password') as FormControl;
  }
  get New_Password() {
    return this.postData.get('New_Password') as FormControl;
  }
}
