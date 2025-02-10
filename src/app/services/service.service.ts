import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, delay, Observable, of, retry, Subject } from 'rxjs';
import { FEventChoice } from '../core/forms/f-events-choice';
import { QrCode } from './params/qrcode';
import { QrVerify } from './params/verify';
import { LoginResponse } from '../core/responses/LoginResponse';
import { IEventOfChoice } from '../core/responses/event-of-choice';
import {
  ICheckedInvitee,
  ICheckedInviteeRes,
} from '../core/responses/checked-invitees';
import { IInviteeRes } from '../core/responses/invitee';
import { IReadQrCode } from '../core/responses/read-qr-code';

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

  EventChoices(body: FEventChoice): Observable<IEventOfChoice> {
    const url = `${this.base_urls}/api/event-of-choice`;
    return this.performPost(url, body, {});
  }
  sendQr(qr: QrCode): Observable<IReadQrCode> {
    try {
      const url = `${this.base_urls}/api/read-qr-code`;
      return this.performPost(url, qr, {});
    } catch {
      this._refreshNeeded$.next();
      return of();
    }
  }
  verifyQr(body: QrVerify): Observable<any> {
    try {
      const url = `${this.base_urls}/api/invitees-verification`;
      return this.performPost(url, body, {});
    } catch {
      this._refreshNeeded$.next();
      return of();
    }
  }
  inviteeChecked(eventId: string): Observable<ICheckedInviteeRes> {
    try {
      return this.https.get(
        `${this.base_urls}/api/checked-in-invitees/${eventId}`,
        {}
      );
    } catch (error) {
      return of();
    }
  }
  getAllInvitees(eventId: string): Observable<IInviteeRes> {
    try {
      return this.https.get(`${this.base_urls}/api/invitees/${eventId}`, {});
    } catch {
      this._refreshNeeded$.next();
      return of();
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
