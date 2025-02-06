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
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  formGroup!: FormGroup;
  constructor(
    private router: Router,
    private appConfig: AppConfigService,
    private service: ServiceService,
    private fb: FormBuilder,
    private location: Location,
    private translateConfigService: TranslateConfigService,
    private tr: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService
  ) {
    addIcons({ arrowBack });
    this.translateConfigService.getDefaultLanguage();
  }
  ngOnInit() {
    this.appConfig.backButtonPressed();
    this.createFormGroup();
  }
  ngOnDestroy(): void {}
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
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const saveDataRequestFailed = (err: any) => {
      if (err.error.errorList) {
        let messages = err.error.errorList;
        AppUtilities.showErrorMessage(messages[0], '');
      } else if (err.error.message) {
        AppUtilities.showErrorMessage(err.error.message, '');
      } else {
        this.tr.get('defaults.errors.failed').subscribe({
          next: (message) => {
            AppUtilities.showErrorMessage(message, '');
          },
        });
      }
    };
    const saveDataRequestSuccess = (res: any) => {
      this.tr
        .get('registrationPage.success.inviteeAddedSuccessfully')
        .pipe(this._unsubscriber.takeUntilDestroy)
        .subscribe({
          next: (message) => {
            AppUtilities.showSuccessMessage('', message);
            this.router
              .navigate(['tabs/tab3'])
              .then(() => {
                this.sharedService.triggerAddedVisitor();
              })
              .catch((err) => console.error(err));
          },
          error: (err) => console.error(err),
        });
    };
    const bodyParams = {
      ...this.formGroup.value,
      mobile_no: `255${this.mobile_no.value}`,
      card_state_mas_sno: '1',
      event_det_sno: this.appConfig.getItemFromSessionStorage(
        AppUtilities.EVENT_ID
      ),
      cust_reg_sno: this.appConfig.getItemFromSessionStorage(
        AppUtilities.TOKEN_Cstomer
      ),
      posted_by: JSON.parse(
        this.appConfig.getItemFromSessionStorage(AppUtilities.TOKEN_user)
      ),
    };
    this.loadingService.startLoading().then((loading) => {
      this.service
        .CustomerRegistration(bodyParams)
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res) => saveDataRequestSuccess(res),
          error: (err) => saveDataRequestFailed(err),
          complete: async () =>
            (await this.loadingService.isLoading()) &&
            this.loadingService.dismiss(),
        });
    });
  }
  backBtn() {
    this.location.back();
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
