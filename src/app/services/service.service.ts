import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, delay, Observable, retry, Subject } from 'rxjs';
import { FEventChoice } from '../core/forms/f-events-choice';
import { QrCode } from './params/qrcode';
import { QrVerify } from './params/verify';
import { LoginResponse } from '../core/responses/LoginResponse';

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
  base_urls = 'https://bizlogicsolutions.co.in:99';
  constructor(private https: HttpClient) {}
  private performPost<T>(url: string, body: T, headers: any) {
    const createHeaders = (headers: Map<string, string>) => {
      let heads = new HttpHeaders();
      for (let [key, value] of Object.entries(headers)) {
        heads = heads.set(key, value);
      }
      return heads;
    };
    return this.https
      .post(url, body, {
        headers: createHeaders(headers),
      })
      .pipe(
        retry(3),
        delay(500),
        catchError((err: any) => {
          throw err;
        })
      ) as Observable<any>;
  }

  loginFunc(body: any): Observable<LoginResponse> {
    const url = `${this.base_urls}/api/login`;
    return this.performPost(url, body, {});
  }

  EventChoices(body: FEventChoice) {
    const url = `${this.base_urls}/api/event-of-choice`;
    return this.performPost(url, body, {});
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
