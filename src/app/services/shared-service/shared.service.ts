import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private pullToRefreshSource = new Subject<void>();
  private addedVisitor = new Subject<void>();
  pullToRefreshSource$ = this.pullToRefreshSource.asObservable();
  addedVisitor$ = this.addedVisitor.asObservable();

  constructor() {}
  triggerPullToRefresh() {
    this.pullToRefreshSource.next();
  }

  triggerAddedVisitor() {
    this.addedVisitor.next();
  }
}
