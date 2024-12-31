import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
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
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { from, finalize } from 'rxjs';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { ServiceService } from 'src/app/services/service.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { LoadingService } from 'src/app/services/loading-service/loading.service';

@Component({
  selector: 'app-qr-code-page',
  templateUrl: './qr-code-page.component.html',
  styleUrls: ['./qr-code-page.component.scss'],
  standalone: true,
  imports: [
    IonButtons,
    CommonModule,
    FormsModule,
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
    IonLoading,
    NavbarComponent,
    MatCardModule,
    MatListModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class QrCodePageComponent implements OnInit {
  result: any;
  qrInfo: any;
  qrjson: any;
  qrcode: any;
  makeJson: any;
  getJson: any;
  split2: any;
  qrResponse: any;
  visitorID: any;
  userInfo: any;
  userId: any;
  conversion: any;
  userIdObj: any;
  verifyresponse: any;
  split3: any;
  qr1: any;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  visitor_id: any;
  cardsize: any;
  cardloop: any;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly TOKEN_user = 'bizlogicj';
  //ji6sd
  private readonly eventIDs = 'event_id';
  event_id: any;
  errMsg: any;
  resp: any;
  msg: any;

  counts: any[] = [];
  inviteeN: any;
  venue: number[] = [];

  input: any;
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private service: ServiceService,
    private _unsubscriber: UnsubscriberService,
    private appConfig: AppConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private tr: TranslateService,
    private loadingService: LoadingService
  ) {
    addIcons({ arrowBack });
  }

  postData = {
    Number_Of_CheckingIn_Invitees: '',
  };

  private prepareScannedCode() {
    this.route.queryParams
      .pipe(this._unsubscriber.takeUntilDestroy)
      .subscribe((params) => {
        let state = this.router.getCurrentNavigation()?.extras.state;
        if (state) {
          this.qrInfo = state['result'];
          this.qrjson = this.qrInfo.split(';');
          this.split2 = this.qrjson[0].split(': ');
          this.split3 = JSON.stringify(this.split2).split(', ');
          this.qr1 = this.split2[1];
          this.qrcode = this.qr1.trim();
          const cardsize = this.qrjson[2].split(': ');
          const inviteeName = this.qrjson[1].split(': ');
          this.inviteeN = inviteeName[1];
          this.cardsize = cardsize[1];
          const venue = this.qrjson[3].split(': ');
          this.venue = venue[1];
          this.counts = Array.from({ length: this.cardsize }, (_, i) => i + 1);
          this.visitorID = this.qrjson[2].split(': ')[1];
          const body = { qr_code: this.qrcode, event_id: this.event_id };
          if (!body.qr_code || body.qr_code.length === 0) {
            this.tr.get('dashboardPage.failedToReadQrCode').subscribe({
              next: (message) => {
                AppUtilities.showErrorMessage('', message);
                this.router.navigate(['tabs/dashboard']);
              },
            });
          }

          let native = from(this.service.sendQr(body));
          native.subscribe({
            next: (res) => {
              this.result = res;
              this.qrResponse = this.result[0];
              this.visitor_id = this.qrResponse.visitor_id;
            },
          });
        }
        if (Number(this.cardsize) === 1) {
          this.autoVerify();
        }
      });
  }

  ngOnInit() {
    this.event_id = localStorage.getItem(this.eventIDs);
    this.prepareScannedCode();
    this.appConfig.backButtonPressed();
  }
  allClear() {
    this.input = '';
  }

  async verify() {
    this.userId = localStorage.getItem(this.TOKEN_user);
    const params = {
      event_id: this.event_id,
      qr_code: this.qrcode,
      Number_Of_CheckingIn_Invitees:
        this.postData.Number_Of_CheckingIn_Invitees,
      User_Id: this.userId,
    };
    this.loadingService
      .startLoading()
      .then((loading) => {
        let native = this.service.verifyQr(params);
        from(native)
          .pipe(
            this._unsubscriber.takeUntilDestroy,
            finalize(() => this.loadingService.dismiss())
          )
          .subscribe({
            next: (res) => {
              this.verifyresponse = res;
              if (this.verifyresponse.status === 1) {
                AppUtilities.showSuccessMessage(
                  '',
                  this.verifyresponse.message
                );
                this.router.navigate(['tabs/dashboard']);
                this.input = '';
              } else {
                AppUtilities.showErrorMessage('', this.verifyresponse.message);
                //this.router.navigate(['tabs/dashboard']);
                this.input = '';
              }
            },
            error: (err) => {
              this.loadingService.dismiss();
              this.errMsg = err;
              this.resp = this.errMsg.error;
              this.msg = this.resp.message;
              this.tr.get('defaults.errors').subscribe({
                next: (err) => {
                  AppUtilities.showErrorMessage(
                    err.failed,
                    err.unexpectedError
                  );
                },
              });
              //this.router.navigate(['tabs/dashboard']);
            },
          });
      })
      .catch((err) => {
        throw err;
      });
  }
  async autoVerify() {
    this.userId = localStorage.getItem(this.TOKEN_user);
    const params = {
      event_id: this.event_id,
      qr_code: this.qrcode,
      Number_Of_CheckingIn_Invitees: '1',
      User_Id: this.userId,
    };
    this.loadingService.startLoading().then((loading) => {
      let native = this.service.verifyQr(params);
      from(native)
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.verifyresponse = res;
            if (this.verifyresponse.status === 1) {
              AppUtilities.showSuccessMessage('', this.verifyresponse.message);
              this.router.navigate(['tabs/dashboard']);
              this.input = '';
            } else {
              AppUtilities.showErrorMessage('', this.verifyresponse.message);
              this.input = '';
            }
          },
          error: (err) => {
            this.loadingService.dismiss();
            this.errMsg = err;
            this.resp = this.errMsg.error;
            this.msg = this.resp.message;
            this.tr.get('defaults.errors').subscribe({
              next: (err) => {
                AppUtilities.showErrorMessage(err.failed, err.unexpectedError);
              },
            });
            //AppUtilities.showErrorMessage('', this.msg);
            //this.router.navigate(['tabs/dashboard']);
          },
        });
    });
  }
  backBtn() {
    this.router.navigate(['tabs/dashboard']);
  }
}
