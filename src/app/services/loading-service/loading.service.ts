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
  filter,
  firstValueFrom,
  lastValueFrom,
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

export const filterNotNull =
  <T>(): OperatorFunction<T, Exclude<T, null | undefined>> =>
  (source$) =>
    source$.pipe(
      filter((value) => value !== null && value !== undefined)
    ) as Observable<Exclude<T, null | undefined>>;

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
    private unsubscribe: UnsubscriberService
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
  beginLoading() {
    const dialogRef = this._dialog.open(LoadingDialogComponent, {
      panelClass: 'dialog-loading-panel-class',
      disableClose: true,
    });
    const ref$ = of(dialogRef);
    ref$
      .pipe(
        filterNotNull(),
        switchMap((loading) =>
          timer(30000).pipe(tap(() => loading && loading.close()))
        ),
        concatMap(() => [])
      )
      .subscribe();
    return ref$;
  }
  dismiss() {
    this.stopLoading();
  }
  async isLoading() {
    let loading = await firstValueFrom(this.loading$.asObservable());
    return loading ? true : false;
  }
}
