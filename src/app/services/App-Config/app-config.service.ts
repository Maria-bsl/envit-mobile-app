import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { IonLoading } from '@ionic/angular/standalone';
import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';
import { from } from 'rxjs';
import { Platform } from '@ionic/angular/standalone';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  loading!: HTMLIonLoadingElement | null | undefined;
  constructor(
    private _unsubscriber: UnsubscriberService,
    private controller: LoadingController,
    private platform: Platform,
    private cLocation: Location
  ) {}

  startLoading(ionLoading: IonLoading) {
    return from(ionLoading.present());
  }

  async openLoading() {
    this.loading = await this.controller.create({
      spinner: 'bubbles',
    });
    await this.loading.present();
    return this.loading;
  }

  async openLoadingWithMessageAndDuration(message: string, duration: number) {
    this.loading = await this.controller.create({
      spinner: 'bubbles',
      message: message,
      duration: duration,
    });
    await this.loading.present();
    return this.loading;
  }

  closeLoading(ionLoading: IonLoading) {
    ionLoading.dismiss();
  }

  backButtonPressed() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.cLocation.back();
      //this.backBtn();
    });
  }
}
