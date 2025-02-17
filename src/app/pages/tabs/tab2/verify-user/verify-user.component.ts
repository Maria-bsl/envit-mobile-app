import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, finalize, from } from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.scss'],
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
  ],
})
export class VerifyUserComponent implements OnInit, OnDestroy {
  MAX_INVITES_FOR_SELECT = 10;
  subscriptions: Subscription[] = [];
  eventname: string = '';
  userId: any;
  qrinfo: any;
  qrcode: any;
  verifyresponse: any;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  visitor_id: any;

  input: string = '';
  result: string = '';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly event_name = 'event_name';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly visitorId = 'visitorID';
  private readonly eventIDs = 'event_id';
  event_id: string = '';
  errMsg: any;
  resp: any;
  msg: any;
  count: any;
  postData!: FormGroup;

  constructor(
    private appConfig: AppConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private service: ServiceService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private _unsubscribe: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private tr: TranslateService
  ) {}
  ngOnInit() {
    this.eventname = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_NAME
    );
    this.event_id = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_ID
    );
    this.appConfig.backButtonPressed();
    this.createPostDataFormGroup();
    this.readQueryParams();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  private switchScanCardErrorMessage(message: string) {
    const dateError =
      'Failed! Card verification must be on date of event.'.toLocaleLowerCase();
    const cardSizeIsEmpty =
      'Please provide number of invitees checking in'.toLocaleLowerCase();
    const cardSizeExceeded =
      'Failed! Number of visitor should not exceed limit.'.toLocaleLowerCase();
    const cardFull =
      'Failed! All invitees have checked-in already.'.toLocaleLowerCase();
    switch (message.toLocaleLowerCase()) {
      case dateError:
        return 'qrpage.cardMustBeScannedOnDateOfEventText';
      case cardSizeIsEmpty:
        return 'qrpage.provideNumberOfVisitorsCheckedIn';
      case cardSizeExceeded:
        return 'qrpage.cardSizeExceeded';
      case cardFull:
        return 'qrpage.inviteesAlreadyCheckedIn';
      default:
        return 'qrpage.failedToScanTryAgain';
    }
  }
  private readQueryParams() {
    this.route.queryParams.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (params) => {
        let state = this.router.getCurrentNavigation()?.extras.state;
        if (state) {
          this.qrinfo = state['qrinfo'];
          this.qrcode = state['qrcode'];
          this.count = Array.from(
            { length: this.qrinfo.unchecked_invitee },
            (_, i) => i + 1
          );
        }
        if (this.qrinfo.unchecked_invitee === 1) {
          this.Number_Of_CheckingIn_Invitees.setValue(1);
          this.verifyuser();
        }
      },
    });
  }
  private maxInviteesValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (Number(value) > 2) {
      return { maximumExceeded: true };
    }
    return null;
  }
  private createPostDataFormGroup() {
    this.postData = this.fb.group({
      Number_Of_CheckingIn_Invitees: this.fb.control('', [
        Validators.required,
        this.maxInviteesValidator,
      ]),
    });
  }
  pressNum(num: any) {
    //Do Not Allow . more than once
    if (num == '.') {
      if (this.input != '') {
      }
    }

    //Do Not Allow 0 at beginning.
    //Javascript will throw Octal literals are not allowed in strict mode.
    if (num == '0') {
      if (this.input == '') {
        return;
      }
      const PrevKey = this.input[this.input.length - 1];
      if (
        PrevKey === '/' ||
        PrevKey === '*' ||
        PrevKey === '-' ||
        PrevKey === '+'
      ) {
        return;
      }
    }
    this.input = this.input + num;

    // this.calcAnswer();
  }
  getAvailableNumberOfInvitees() {
    return Array.from(
      { length: this.qrinfo.unchecked_invitee },
      (_, i) => i + 1
    );
  }
  allClear() {
    // this.result = '';
    this.input = '';
  }
  private openDashboard() {
    this.router
      .navigate(['tabs/dashboard'])
      .then(() => {
        this.sharedService.triggerPullToRefresh();
      })
      .catch((err) => console.error(err));
  }
  verifyuser() {
    if (this.postData.invalid) {
      return;
    }
    this.userId = this.appConfig.getItemFromSessionStorage(
      AppUtilities.TOKEN_user
    );
    this.visitor_id = this.qrinfo.visitor_id;
    const qrcode = this.qrcode;
    const params = {
      event_id: this.event_id,
      qr_code: qrcode,
      Number_Of_CheckingIn_Invitees: this.Number_Of_CheckingIn_Invitees.value,
      User_Id: this.userId,
    };
    this.loadingService.startLoading().then((loading) => {
      let native = from(this.service.verifyQr(params));
      native.pipe(finalize(() => this.loadingService.dismiss())).subscribe({
        next: (res) => {
          this.verifyresponse = res;
          if (this.verifyresponse.status == 1) {
            this.tr
              .get('qrpage.successfullyScanned')
              .pipe(this._unsubscribe.takeUntilDestroy)
              .subscribe({
                next: (message) => {
                  AppUtilities.showSuccessMessage('', message);
                  this.openDashboard();
                },
                error: (err) => console.error(err),
              });
            this.input = '';
            ``;
          } else {
            const msg = this.switchScanCardErrorMessage(
              this.verifyresponse.message
            );
            this.tr
              .get(msg)
              .pipe(this._unsubscribe.takeUntilDestroy)
              .subscribe({
                next: (message) => AppUtilities.showErrorMessage('', message),
                error: (err) => console.error(err),
              });
            this.input = '';
          }
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
  get Number_Of_CheckingIn_Invitees() {
    return this.postData.get('Number_Of_CheckingIn_Invitees') as FormControl;
  }
}
