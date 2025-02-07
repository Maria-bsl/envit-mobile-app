import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { IonLoading } from '@ionic/angular/standalone';
import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';
import { from } from 'rxjs';
import { Platform } from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  loading!: HTMLIonLoadingElement | null | undefined;
  constructor(
    private _unsubscriber: UnsubscriberService,
    private controller: LoadingController,
    private platform: Platform,
    private cLocation: Location,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Registers icons to be available to <mat-icon>
   * @param icons - List of icon names with .svg file extension excluded
   * @param path - Folder path where to find icons specified
   */
  addIcons(icons: string[], path: string) {
    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${path}/${icon}.svg`)
      );
    });
  }

  startLoading(ionLoading: IonLoading) {
    return from(ionLoading.present());
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

  /**
   * Adds an item to session storage
   * @param key item key
   * @param value
   */
  addSessionStorageItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }
  clearSessionStorage() {
    sessionStorage.length > 0 && sessionStorage.clear();
  }
  getItemFromSessionStorage(key: string) {
    const item = sessionStorage.getItem(key);
    return item ?? '';
  }
  backButtonEventHandler(callback: () => {}) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      callback();
    });
  }
  getPreviousRoute(history: string[]): string {
    return history.length > 1 ? history[history.length - 2] : '';
  }
}
