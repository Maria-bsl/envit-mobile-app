import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, finalize } from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { ServiceService } from 'src/app/services/service.service';
import { TranslateConfigService } from 'src/app/translate-config.service';
import { Location } from '@angular/common';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { addIcons } from 'ionicons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonSelect,
  IonLabel,
  IonButtons,
  IonLoading,
  Platform,
} from '@ionic/angular/standalone';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    //IonicModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButtons,
    IonButton,
  ],
})
export class RegistrationPageComponent implements OnInit, OnDestroy {
  private readonly TOKEN_user = 'bizlogicj';
  private readonly eventIDs = 'event_id';
  private readonly TOKEN_Cstomer = 'cstID';
  subscriptions: Subscription[] = [];
  formGroup!: FormGroup;
  posted_id: any;
  user: any;
  event_id: any;
  response: any;
  cust_reg_sno: any;
  language: any;
  constructor(
    private router: Router,
    //private loadingCtrl: LoadingController,
    private appConfig: AppConfigService,
    private service: ServiceService,
    private fb: FormBuilder,
    private location: Location,
    private translateConfigService: TranslateConfigService,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private platform: Platform
  ) {
    addIcons({ arrowBack });
    this.translateConfigService.getDefaultLanguage();
    this.language = this.translateConfigService.getCurrentLang();
  }
  ngOnInit() {
    this.user = localStorage.getItem(this.TOKEN_user);
    this.event_id = localStorage.getItem(this.eventIDs);
    this.cust_reg_sno = localStorage.getItem(this.TOKEN_Cstomer);

    this.posted_id = JSON.parse(this.user);
    this.createFormGroup();
    this.appConfig.backButtonPressed();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  private createFormGroup() {
    this.formGroup = this.fb.group({
      visitor_name: this.fb.control('', [Validators.required]),
      mobile_no: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[67]\d{8}$/),
      ]),
      no_of_persons: this.fb.control('', [Validators.required]),
      table_number: this.fb.control('', []),
      email_address: this.fb.control('', [Validators.email]),
    });
  }
  PostData = {
    visitor_name: '',
    no_of_persons: '',
    table_number: '',
    email_address: '',
    mobile_no: '',
  };
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const bodyparams = {
      ...this.formGroup.value,
      mobile_no: '255' + this.mobile_no.value,
      card_state_mas_sno: '1',
      event_det_sno: this.event_id,
      cust_reg_sno: this.cust_reg_sno,
      posted_by: this.posted_id,
    };
    this.appConfig.openLoading().then((loading) => {
      this.service
        .CustomerRegistration(bodyparams)
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.response = res;
            AppUtilities.showSuccessMessage('', this.response.response);
            this.router.navigate(['tabs/tab2']);
          },
          error: (err) => {
            if (err.error.errorList) {
              let messages = err.error.errorList;
              AppUtilities.showErrorMessage(messages[0], '');
            } else if (err.error.message) {
              AppUtilities.showErrorMessage(err.error.message, '');
            } else {
              this.translate.get('defaults.errors.failed').subscribe({
                next: (message) => {
                  AppUtilities.showErrorMessage(message, '');
                },
              });
            }
          },
        });
    });
  }
  backBtn() {
    this.location.back();
    //this.router.navigate(['tabs/tab2']);
  }
  get visitor_name() {
    return this.formGroup.get('visitor_name') as FormControl;
  }
  get mobile_no() {
    return this.formGroup.get('mobile_no') as FormControl;
  }
  get no_of_persons() {
    return this.formGroup.get('no_of_persons') as FormControl;
  }
  get table_number() {
    return this.formGroup.get('table_number') as FormControl;
  }
  get email_address() {
    return this.formGroup.get('email_address') as FormControl;
  }
}
