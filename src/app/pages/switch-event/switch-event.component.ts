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
import { EventDetailsResponse } from 'src/app/core/interfaces/EventDetailsResponse';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { EventChoice } from 'src/app/services/params/eventschoice';
import { ServiceService } from 'src/app/services/service.service';
import {
  IonLoading,
  IonContent,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';

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
    private _unsubscriber: UnsubscriberService
  ) {}
  ngOnInit() {
    this.eventsList = JSON.parse(
      localStorage.getItem('event_details_list') ?? ''
    );
    if (!this.eventsList) this.router.navigate(['login']);
    else {
      let eventId = localStorage.getItem('event_id');
      if (eventId !== undefined && eventId !== null) {
        let found = this.eventsList.find((c) => c.event_id === Number(eventId));
        if (found) {
          this.selected = this.eventsList.indexOf(found);
        }
      }
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  eventChanged(index: any) {
    if (index < 0 || index > this.eventsList.length - 1)
      throw Error('Event index is out of range.');
    this.selected = index;
    let event = this.eventsList.at(this.selected);
    if (event) {
      localStorage.setItem('event_name', event.event_name);
    }
  }
  openSelectedEvent(selected: EventDetailsResponse) {
    const navigationExtras: NavigationExtras = {
      state: {
        data_from_user: selected.event_id,
      },
      replaceUrl: true,
    };
    let event = this.eventsList.at(this.selected);
    if (event) {
      localStorage.setItem('event_id', event.event_id.toString());
    }
    this.router.navigateByUrl('tabs/dashboard', navigationExtras);
  }
  async openDashboard() {
    if (this.selected === -1) {
      AppUtilities.showWarningMessage('', 'Please select an event');
      return;
    }
    let selected: EventDetailsResponse = this.eventsList.at(this.selected)!;
    let tokenName = localStorage.getItem(AppUtilities.TOKEN_NAME);
    if (tokenName) {
      const params = {
        mobile_number: JSON.parse(tokenName).mobile,
        event_id: selected.event_id.toString(),
      } as EventChoice;
      this.appConfig
        .startLoading(this.ionLoading)
        .pipe(this._unsubscriber.takeUntilDestroy)
        .subscribe({
          next: () => {
            this.service
              .EventChoices(params)
              .pipe(
                finalize(() => this.appConfig.closeLoading(this.ionLoading))
              )
              .subscribe({
                next: (result: any) => {
                  localStorage.setItem(
                    AppUtilities.TOKEN_user,
                    result.user_id.toString()
                  );
                  localStorage.setItem(
                    AppUtilities.TOKEN_Cstomer,
                    result.customer_admin_id.toString()
                  );
                },
                error: (error) => {
                  this.appConfig.closeLoading(this.ionLoading);
                  throw error;
                },
                complete: () => {
                  this.openSelectedEvent(selected);
                },
              });
          },
        });
    }
  }
}
