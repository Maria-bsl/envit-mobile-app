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
    //private loadingCtrl: LoadingController,
    private appConfig: AppConfigService,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService
  ) {}
  postData = {
    qrcode: '',
  };
  ngOnInit() {
    this.eventname = localStorage.getItem(this.event_name)!;
    this.event_id = localStorage.getItem(this.eventIDs)!;
  }
  ngOnDestroy(): void {
    this.subsriptions.forEach((s) => s.unsubscribe());
  }
  sendQr() {
    const body = { qr_code: this.postData.qrcode, event_id: this.event_id };
    this.appConfig.openLoading().then((loading) => {
      const native = from(this.service.sendQr(body));
      native
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
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
                this.verify();
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

  verify() {
    this.userId = localStorage.getItem(this.TOKEN_user);
    this.visitor_id = this.qrResponse.visitor_id;
    const qrcode = this.qrcode;

    const params = {
      event_id: this.event_id,
      qr_code: this.postData.qrcode,
      Number_Of_CheckingIn_Invitees: '1',
      User_Id: this.userId,
    };
    this.appConfig.openLoading().then((loading) => {
      let native = from(this.service.verifyQr(params));
      native
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.verifyresponse = res;
            if (this.verifyresponse.status == 1) {
              AppUtilities.showSuccessMessage('', this.verifyresponse.message);
              this.router.navigate(['tabs/dashboard']);
              this.input = '';
              ``;
            } else {
              AppUtilities.showErrorMessage('', this.verifyresponse.message);
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
  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
