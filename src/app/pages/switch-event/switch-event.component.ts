import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
//import { EventDetailsResponse } from 'src/app/core/interfaces/EventDetailsResponse';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
//import { EventChoice } from 'src/app/services/params/eventschoice';
import { ServiceService } from 'src/app/services/service.service';
import {
  IonLoading,
  IonContent,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { EventDetailsResponse } from 'src/app/core/responses/LoginResponse';
import { FEventChoice } from 'src/app/core/forms/f-events-choice';
import { LoadingService } from 'src/app/services/loading-service/loading.service';

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
})
export class SwitchEventComponent implements OnInit, OnDestroy {
  selected: number = -1;
  eventsList: EventDetailsResponse[] = [];
  subscriptions: Subscription[] = [];
  @ViewChild('ionLoading') ionLoading!: IonLoading;
  constructor(
    private router: Router,
    private controller: LoadingController,
    private service: ServiceService,
    private appConfig: AppConfigService,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService
  ) {}
  ngOnInit() {
    try {
      this.eventsList = JSON.parse(
        this.appConfig.getItemFromSessionStorage(
          AppUtilities.EVENT_DETAILS_LIST
        )
      );
      if (!this.eventsList) this.router.navigate(['login']);
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
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  eventChanged(index: any) {
    if (index < 0 || index > this.eventsList.length - 1)
      throw Error('Event index is out of range.');
    this.selected = index;
    const event = this.eventsList.at(this.selected);
    if (event) {
      this.appConfig.addSessionStorageItem(
        AppUtilities.EVENT_NAME,
        event.event_name
      );
    }
  }
  openSelectedEvent(selected: EventDetailsResponse) {
    const navigationExtras: NavigationExtras = {
      state: {
        data_from_user: selected.event_id,
      },
      replaceUrl: true,
    };
    const event = this.eventsList.at(this.selected);
    event &&
      this.appConfig.addSessionStorageItem(
        AppUtilities.EVENT_ID,
        event.event_id.toString()
      );
    this.router.navigateByUrl('tabs/dashboard', navigationExtras);
  }
  async openDashboard() {
    if (this.selected === -1) {
      AppUtilities.showWarningMessage('', 'Please select an event');
      return;
    }
    const selected: EventDetailsResponse = this.eventsList.at(this.selected)!;
    const tokenName = this.appConfig.getItemFromSessionStorage(
      AppUtilities.TOKEN_NAME
    );
    if (tokenName) {
      const params = {
        mobile_number: JSON.parse(tokenName).mobile,
        event_id: selected.event_id.toString(),
      } as FEventChoice;
      this.loadingService.startLoading().then(() => {
        this.service
          .EventChoices(params)
          .pipe(
            this._unsubscriber.takeUntilDestroy,
            finalize(() => this.loadingService.dismiss())
          )
          .subscribe({
            next: (result: any) => {
              this.appConfig.addSessionStorageItem(
                AppUtilities.TOKEN_user,
                result.user_id.toString()
              );
              this.appConfig.addSessionStorageItem(
                AppUtilities.TOKEN_Cstomer,
                result.customer_admin_id.toString()
              );
            },
            error: (error) => {
              throw error;
            },
            complete: () => {
              this.openSelectedEvent(selected);
            },
          });
      });
    }
  }
}
