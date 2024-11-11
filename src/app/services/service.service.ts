import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { EventChoice } from './params/eventschoice';
import { QrCode } from './params/qrcode';
import { QrVerify } from './params/verify';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly TOKEN_NAME = 'profanis_auth';

  private _refreshNeeded$ = new Subject<void>();
  datas: any;
  IP: any;
  get refreshNeeded$() {
    return this._refreshNeeded$;
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  base_urls = 'https://bizlogicsolutions.co.in:99';
  // base_urls = "http://192.168.100.50:99";
  constructor(private https: HttpClient) {}

  loginFunc(login: any) {
    return this.https.post(this.base_urls + '/api/login', login);
  }

  EventChoices(choice: EventChoice) {
    return this.https.post(
      this.base_urls + '/api/event-of-choice',
      choice
      // eslint-disable-next-line @typescript-eslint/naming-convention
    );
  }
  sendQr(qr: QrCode) {
    try {
      //this._refreshNeeded$.next();
      return this.https.post(this.base_urls + '/api/read-qr-code', qr);
    } catch {
      this._refreshNeeded$.next();
      return Promise.resolve();
    }
  }
  verifyQr(verify: QrVerify) {
    try {
      return this.https.post(
        this.base_urls + '/api/invitees-verification',
        verify
      );
    } catch {
      this._refreshNeeded$.next();
      return Promise.resolve();
    }
  }
  inviteeChecked(eventId: any) {
    return this.https.get(
      this.base_urls + '/api/checked-in-invitees/' + eventId,
      {}
    );
  }
  getAllinvitee(eventId: any) {
    try {
      return this.https.get(this.base_urls + '/api/invitees/' + eventId, {});
    } catch {
      this._refreshNeeded$.next();
      return Promise.resolve();
    }
  }
  Forgetpwd(Mob_num: any) {
    return this.https.post(
      this.base_urls + '/api/forgot-password',
      { mobile_number: Mob_num }
      // eslint-disable-next-line @typescript-eslint/naming-convention
    );
  }
  ChangePswd(data: any) {
    return this.https.post(
      this.base_urls + '/api/change-password',
      {
        mobile_number: data.mobile_number,
        current_password: data.current_password,
        New_Password: data.New_Password,
      }
      // eslint-disable-next-line @typescript-eslint/naming-convention
    );
  }

  CustomerRegistration(data: any) {
    return this.https.post(this.base_urls + '/api/invitees/register', data);
  }
}
