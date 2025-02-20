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
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import {
  Subscription,
  catchError,
  finalize,
  from,
  mergeMap,
  switchMap,
} from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';
import { IReadQrCode } from 'src/app/core/responses/read-qr-code';

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
  providers: [TranslatePipe],
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private service: ServiceService,
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private _trPipe: TranslatePipe
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
  ngOnInit() {}
  ngOnDestroy(): void {}
  sendQr(event: Event) {
    const erroneousRes = async (err: any) => {
      switch (err.error.message.toLocaleLowerCase()) {
        case 'Failed! Invitee does not exist.'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this.tr.instant('verifyCode.form.errors.inviteeNotExist')
          );
          break;
        default:
          AppUtilities.showErrorMessage(
            '',
            this.tr.instant('verifyCode.form.errors.codeNotFound')
          );
          break;
      }
    };
    const success = (result: IReadQrCode) => {
      if (!result) return;
      const navigationExtras: NavigationExtras = {
        state: {
          qrinfo: result,
          qrcode: this.postData.qrcode,
        },
      };
      if (result.unchecked_invitee === 1) {
        this.verifyOneVisitor();
      } else {
        this.router.navigate(['tabs/tab2/verifyuser'], navigationExtras);
      }
    };
    const body = {
      qr_code: this.postData.qrcode,
      event_id: this.appConfig.getItemFromSessionStorage(AppUtilities.EVENT_ID),
    };
    this.loadingService
      .beginLoading()
      .pipe(
        this._unsubscriber.takeUntilDestroy,
        switchMap((loading) =>
          this.service.sendQr(body).pipe(
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err)),
            filterNotNull()
          )
        )
      )
      .subscribe(success);
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
    const erroneousRes = async (err: any) => {
      switch (err.error.message.toLocaleLowerCase()) {
        case 'Failed! Invitee does not exist.'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this.tr.instant('verifyCode.form.errors.inviteeNotExist')
          );
          break;
        case 'Failed! Card verification must be on date of event.'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform(
              this.tr.instant('verifyUser.form.errors.invalidVerificationDate')
            )
          );
          break;
        default:
          AppUtilities.showErrorMessage(
            '',
            this.tr.instant('verifyUser.form.errors.failedToVerifyCard')
          );
          break;
      }
    };
    const success = (result: any) => {
      if (result.status === 1) {
        AppUtilities.showSuccessMessage(
          '',
          this.tr.instant('qrpage.successfullyScanned')
        );
        this.openDashboard();
      } else {
        const message = this.switchScanCardErrorMessage(result.message);
        AppUtilities.showErrorMessage('', this.tr.instant(message));
      }
    };
    const body = {
      event_id: this.appConfig.getItemFromSessionStorage(AppUtilities.EVENT_ID),
      qr_code: this.postData.qrcode,
      Number_Of_CheckingIn_Invitees: '1',
      User_Id: this.appConfig.getItemFromSessionStorage(
        AppUtilities.TOKEN_user
      ),
    };
    this.loadingService
      .beginLoading()
      .pipe(
        this._unsubscriber.takeUntilDestroy,
        mergeMap((loading) =>
          this.service.verifyQr(body).pipe(
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err)),
            filterNotNull()
          )
        )
      )
      .subscribe(success);
  }
}
