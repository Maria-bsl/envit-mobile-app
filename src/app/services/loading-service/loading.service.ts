import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../components/dialogs/loading-dialog/loading-dialog.component';
import { BehaviorSubject, firstValueFrom, lastValueFrom, tap } from 'rxjs';
import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading$ = new BehaviorSubject<
    false | MatDialogRef<LoadingDialogComponent, any>
  >(false);
  constructor(
    private readonly _dialog: MatDialog,
    private unsubscribe: UnsubscriberService
  ) {}
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
    setTimeout(() => {
      this.isLoading()
        .then((isLoading) => isLoading && this.dismiss())
        .catch((err) => {
          console.error(err);
          this.dismiss();
        });
    }, LIMIT);
    this.loading$.next(dialogRef);
    return firstValueFrom(this.loading$.asObservable());
  }
  dismiss() {
    this.stopLoading();
  }
  async isLoading() {
    let loading = await firstValueFrom(this.loading$.asObservable());
    return loading ? true : false;
  }
}
