import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription, catchError, finalize, mergeMap } from 'rxjs';
//import { EventDetailsResponse } from 'src/app/core/interfaces/EventDetailsResponse';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
//import { EventChoice } from 'src/app/services/params/eventschoice';
import { ServiceService } from 'src/app/services/service.service';
import {
  IonLoading,
  IonContent,
  IonText,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { EventDetailsResponse } from 'src/app/core/responses/LoginResponse';
import { FEventChoice } from 'src/app/core/forms/f-events-choice';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IEventOfChoice } from 'src/app/core/responses/event-of-choice';

@Component({
  selector: 'app-switch-event',
  templateUrl: './switch-event.component.html',
  styleUrls: ['./switch-event.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    //IonicModule,
    IonLoading,
    IonContent,
    IonText,
    IonButton,
    MatListModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatButtonModule,
    NavbarComponent,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class SwitchEventComponent implements OnInit, OnDestroy {
  selected: number = -1;
  eventsList: EventDetailsResponse[] = [];
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private router: Router,
    private controller: LoadingController,
    private service: ServiceService,
    private appConfig: AppConfigService,
    private _unsubscribe: UnsubscriberService,
    private loadingService: LoadingService,
    private navCtrl: NavController,
    private _trPipe: TranslatePipe
  ) {
    const backButton = () => {
      const backToLogin = () => new Promise<void>((r, j) => r());
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  ngOnInit() {
    try {
      this.eventsList = JSON.parse(
        this.appConfig.getItemFromSessionStorage(
          AppUtilities.EVENT_DETAILS_LIST
        )
      );
      if (!this.eventsList) this.navCtrl.navigateRoot('/login');
      const eventId = this.appConfig.getItemFromSessionStorage(
        AppUtilities.EVENT_ID
      );
      if (eventId) {
        const found = this.eventsList.find(
          (c) => c.event_id === Number(eventId)
        );
        found && (this.selected = this.eventsList.indexOf(found));
      }
    } catch (error: any) {
      this.eventsList = [];
    }
  }
  ngOnDestroy(): void {}
  eventChanged(index: any) {
    if (index < 0 || index > this.eventsList.length - 1)
      throw Error('Event index is out of range.');
    this.selected = index;
    const event = this.eventsList.at(this.selected);
    event &&
      this.appConfig.addSessionStorageItem(
        AppUtilities.EVENT_NAME,
        event.event_name
      );
  }
  openSelectedEvent(eventId: number) {
    const navigationExtras: NavigationExtras = {
      state: {
        data_from_user: eventId,
      },
      replaceUrl: true,
    };
    const event = this.eventsList.at(this.selected);
    event &&
      this.appConfig.addSessionStorageItem(
        AppUtilities.EVENT_ID,
        eventId.toString()
      );
    this.router.navigate(['/tabs/dashboard'], { ...navigationExtras });
  }
  openDashboard(event: MouseEvent) {
    const params = (mobile: string, eventId: string): FEventChoice => {
      return {
        mobile_number: mobile,
        event_id: eventId,
      };
    };
    const tokenName = (token: string) => {
      return this.appConfig.getItemFromSessionStorage(token) ?? '';
    };
    const erroneousRes = async (err: HttpErrorResponse | any) => {
      const httpDataResponseSwitch = (e: HttpErrorResponse) => {
        switch (e.status) {
          case 404:
            AppUtilities.showErrorMessage(
              '',
              this._trPipe.transform('switchEvent.eventNotExist')
            );
            break;
          case 0:
            AppUtilities.showErrorMessage(
              '',
              this._trPipe.transform('defaults.errors.connectionFailed')
            );
            break;
        }
      };
      if (err instanceof HttpErrorResponse) {
        httpDataResponseSwitch(err);
      } else {
      }
    };
    const selected: EventDetailsResponse | undefined = this.eventsList.at(
      this.selected
    );
    const parseResponse = (result: void | IEventOfChoice) => {
      if (!result) return;
      this.appConfig.addSessionStorageItem(
        AppUtilities.TOKEN_user,
        result.user_id!.toString()
      );
      this.appConfig.addSessionStorageItem(
        AppUtilities.TOKEN_Cstomer,
        result.customer_admin_id!.toString()
      );
      selected && this.openSelectedEvent(selected.event_id);
    };
    !selected &&
      AppUtilities.showWarningMessage('', 'switchEvent.pleaseSelectEvent');
    if (selected) {
      const mobile = JSON.parse(tokenName(AppUtilities.TOKEN_NAME)).mobile;
      const eventId = selected?.event_id?.toString();
      this.loadingService
        .beginLoading()
        .pipe(
          this._unsubscribe.takeUntilDestroy,
          mergeMap((loading) =>
            this.service.EventChoices(params(mobile, eventId)).pipe(
              finalize(() => loading.close()),
              catchError((err) => erroneousRes(err)),
              filterNotNull()
            )
          )
        )
        .subscribe(parseResponse);
    }
  }
}
