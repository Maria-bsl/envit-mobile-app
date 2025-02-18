import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../components/dialogs/loading-dialog/loading-dialog.component';
import {
  BehaviorSubject,
  concatMap,
  defer,
  filter,
  firstValueFrom,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
  Subject,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';
import { AppConfigService } from '../App-Config/app-config.service';

export const filterNotNull =
  <T>(): OperatorFunction<T, Exclude<T, null | undefined | void>> =>
  (source$) =>
    source$.pipe(
      filter((value) => value !== null && value !== undefined)
    ) as Observable<Exclude<T, null | undefined | void>>;

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading$ = new BehaviorSubject<
    false | MatDialogRef<LoadingDialogComponent, any>
  >(false);
  load$ = new ReplaySubject<MatDialogRef<LoadingDialogComponent, any>>();
  private _loading$ = this.load$.asObservable();
  constructor(
    private readonly _dialog: MatDialog,
    private unsubscribe: UnsubscriberService,
    private _appConfig: AppConfigService
  ) {
    const loaderTimeout = (LIMIT: number) => {
      this._loading$
        .pipe(
          filterNotNull(),
          switchMap((loading) =>
            timer(LIMIT).pipe(tap(() => loading && loading.close()))
          ),
          concatMap(() => [])
        )
        .subscribe();
    };
    loaderTimeout(30000);
  }
  private stopLoading() {
    let promise = firstValueFrom(this.loading$.asObservable());
    promise
      .then((loading: boolean | MatDialogRef<LoadingDialogComponent, any>) => {
        if (loading) {
          let ref = loading as MatDialogRef<LoadingDialogComponent, any>;
          ref.close();
          this.loading$.next(false);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  async startLoading() {
    let isLoading = await this.isLoading();
    if (isLoading) this.stopLoading();
    let dialogRef = this._dialog.open(LoadingDialogComponent, {
      panelClass: 'dialog-loading-panel-class',
      disableClose: true,
    });
    const LIMIT = 30000;
    setTimeout(async () => {
      const isLoading = await this.isLoading();
      isLoading && this.dismiss();
    }, LIMIT);
    this.loading$.next(dialogRef);
    return firstValueFrom(this.loading$.asObservable());
  }
  beginLoading(timeout = 30000) {
    const dialogRef = () =>
      this._dialog.open(LoadingDialogComponent, {
        panelClass: 'dialog-loading-panel-class',
        disableClose: true,
      });
    return defer(() => of(dialogRef)).pipe(
      map((ref) => ref()),
      tap((loading) =>
        timer(timeout).subscribe((next) => loading && loading.close())
      )
    );
  }
  dismiss() {
    this.stopLoading();
  }
  async isLoading() {
    let loading = await firstValueFrom(this.loading$.asObservable());
    return loading ? true : false;
  }
}
