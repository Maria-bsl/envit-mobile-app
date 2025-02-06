import { Component, OnDestroy, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription, finalize, from } from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    MatFormFieldModule,
    MatInputModule,
    NavbarComponent,
    FormsModule,
    TranslateModule,
  ],
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
  subsriptions: Subscription[] = [];
  eventname: string = '';
  result: any;
  qrResponse: any;
  private readonly TOKEN_user = 'bizlogicj';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly event_name = 'event_name';
  private readonly eventIDs = 'event_id';
  event_id: string = '';
  errMsg: any;
  resp: any;
  msg: any;
  userId: any;
  visitor_id: any;
  qrcode: any;
  verifyresponse: any;
  qrinfo: any;
  input: string = '';
  constructor(
    private router: Router,
    private service: ServiceService,
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService
  ) {}
  postData = {
    qrcode: '',
  };
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
  ngOnInit() {
    this.eventname = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_NAME
    );
    this.event_id = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_ID
    );
  }
  ngOnDestroy(): void {
    this.subsriptions.forEach((s) => s.unsubscribe());
  }
  sendQr() {
    const body = { qr_code: this.postData.qrcode, event_id: this.event_id };
    this.loadingService.startLoading().then((loading) => {
      const native = from(this.service.sendQr(body));
      native
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.result = res;
            this.qrResponse = this.result;
            if (this.result.message) {
              AppUtilities.showErrorMessage('', this.result.message);
            } else if (this.qrResponse) {
              const navigationExtras: NavigationExtras = {
                state: {
                  qrinfo: this.qrResponse,
                  qrcode: this.postData.qrcode,
                },
              };
              if (this.qrResponse.unchecked_invitee == 1) {
                this.verifyOneVisitor();
              } else {
                this.router.navigate(
                  ['tabs/tab2/verifyuser'],
                  navigationExtras
                );
              }
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
  private openDashboard() {
    this.router
      .navigate(['tabs/dashboard'])
      .then(() => {
        this.sharedService.triggerPullToRefresh();
      })
      .catch((err) => console.error(err));
  }
  verifyOneVisitor() {
    this.userId = this.appConfig.getItemFromSessionStorage(
      AppUtilities.TOKEN_user
    );
    this.visitor_id = this.qrResponse.visitor_id;

    const params = {
      event_id: this.event_id,
      qr_code: this.postData.qrcode,
      Number_Of_CheckingIn_Invitees: '1',
      User_Id: this.userId,
    };
    this.loadingService.startLoading().then((loading) => {
      let native = from(this.service.verifyQr(params));
      native
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.verifyresponse = res;
            if (this.verifyresponse.status == 1) {
              this.tr
                .get('qrpage.successfullyScanned')
                .pipe(this._unsubscriber.takeUntilDestroy)
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
                .pipe(this._unsubscriber.takeUntilDestroy)
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
            this.router.navigate(['tabs/dashboard']);
          },
        });
    });
  }
  changepass() {
    this.router.navigate(['changepwd']);
  }
}
