import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  AnimationController,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationExtras } from '@angular/router';
import {
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  catchError,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  of,
  pairwise,
  switchMap,
  tap,
  withLatestFrom,
  zip,
} from 'rxjs';
import { InviteesTable } from 'src/app/core/enums/invitees-table';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import {
  inOutAnimation,
  listAnimationDesktop,
} from 'src/app/core/shared/fade-in-out-animation';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { MatRippleModule } from '@angular/material/core';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';
import { IInviteeRes, Visitor } from 'src/app/core/responses/invitee';
import { IReadQrCode } from 'src/app/core/responses/read-qr-code';
import {
  ICheckedInvitee,
  ICheckedInviteeRes,
} from 'src/app/core/responses/checked-invitees';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  animations: [inOutAnimation, listAnimationDesktop],
  imports: [
    IonIcon,
    NavbarComponent,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
    IonContent,
    IonButton,
    IonText,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    MatRippleModule,
  ],
  providers: [TranslatePipe],
})
export class Tab3Page implements OnInit, OnDestroy, AfterViewInit {
  showingList: boolean = true;
  guestIn: any;
  eventname: string = '';
  InviteesTable: typeof InviteesTable = InviteesTable;
  event_id: any;
  dataSource: MatTableDataSource<Visitor> = new MatTableDataSource<Visitor>();
  searchInput: FormControl = new FormControl('', []);
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChildren('templateList', { read: ElementRef })
  templateListRef!: QueryList<ElementRef>;
  filteredInput = new FormControl<boolean | null>(null, []);
  checkedInvitees$ = new ReplaySubject<ICheckedInvitee[]>();
  allInvitees$ = new ReplaySubject<Visitor[]>();
  constructor(
    private service: ServiceService,
    private appConfig: AppConfigService,
    private router: Router,
    private animationCtrl: AnimationController,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private _unsubsriber: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private tr: TranslateService,
    private _trPipe: TranslatePipe
  ) {
    addIcons({ addOutline });
    this.filterInputChanged();
    this.filteredInput.setValue(false);
  }
  private filterInputChanged() {
    const isFractionEqualToOne = (fractionStr: string) => {
      const parts = fractionStr.split('/');
      if (parts.length !== 2) return false;
      const numerator = parseInt(parts[0], 10);
      const denominator = parseInt(parts[1], 10);
      if (denominator === 0) return false;
      return numerator / denominator === 1;
    };
    const filterUncheckedInvitees = (lists: [ICheckedInvitee[], Visitor[]]) => {
      const checkedInvitees = lists[0].filter((checked) =>
        isFractionEqualToOne(checked.scan_status!)
      );
      return lists[1].filter((invitee) =>
        checkedInvitees.every(
          (checked) => checked.visitor_name != invitee.visitor_name
        )
      );
    };
    this.filteredInput.valueChanges
      .pipe(
        this._unsubsriber.takeUntilDestroy,
        filterNotNull(),
        switchMap((value) =>
          zip(
            this.checkedInvitees$.asObservable(),
            this.allInvitees$.asObservable()
          )
        ),
        withLatestFrom(this.filteredInput.valueChanges),
        map(([lists, value]) =>
          JSON.parse(value as any as string)
            ? filterUncheckedInvitees(lists)
            : lists[1]
        ),
        filterNotNull()
      )
      .subscribe({
        next: (visitors) => {
          (this.dataSource.data = visitors) && this.dataSourceFilter();
          this.dataSource.paginator = this.paginator;
        },
      });
  }
  private registerIcons() {
    let featherIcons = ['list', 'grid'];
    featherIcons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        `${icon}`,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `/assets/feather/${icon}.svg`
        )
      );
    });
    let bootstrapIcons = ['card-checklist', 'table', 'qr-code-scan'];
    bootstrapIcons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        `${icon}`,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `/assets/boostrap-icons/${icon}.svg`
        )
      );
    });
  }
  private dataSourceFilter() {
    const filterPredicate = (data: any, filter: string) => {
      return data.visitor_name &&
        data.visitor_name
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase())
        ? true
        : false;
    };
    this.dataSource.filterPredicate = filterPredicate;
  }
  private searchInputChanged() {
    this.searchInput.valueChanges
      .pipe(this._unsubsriber.takeUntilDestroy)
      .subscribe({
        next: (searchText) => {
          this.dataSource.filter = searchText.trim().toLocaleLowerCase();
          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
      });
  }
  private addedVisitorHandler() {
    this.sharedService.addedVisitor$
      .pipe(this._unsubsriber.takeUntilDestroy)
      .subscribe({
        next: () => this.requestInviteesList(),
        error: (err) => console.error(err),
      });
  }
  ngOnInit() {
    this.registerIcons();
    this.requestInviteesList();
    this.searchInputChanged();
    this.addedVisitorHandler();
  }
  ngAfterViewInit(): void {
    this.initListAnimation();
  }
  initListAnimation() {
    const itemRefArray = this.templateListRef.toArray();
    for (let i = 0; i < itemRefArray.length; i++) {
      const element = itemRefArray[i].nativeElement;

      this.animationCtrl
        .create()
        .addElement(element)
        .duration(1000)
        .delay(i * (1000 / 3))
        .easing('cubic-bezier(0.4, 0.0, 0.2, 1.0)')
        .fromTo('transform', 'translateY(50px)', 'translateY(0px)')
        .fromTo('opacity', '0', '1')
        .play();
    }
  }
  requestInviteesList() {
    this.eventname = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_NAME
    );
    this.event_id = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_ID
    );
    const erroneousRes = async (err: any) => {
      switch (err.error.message.toLocaleLowerCase()) {
        case 'Failed! Invitee does not exist.'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform('verifyCode.form.errors.inviteeNotExist')
          );
          break;
        default:
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform('verifyCode.form.errors.codeNotFound')
          );
          break;
      }
    };
    const success = (res: [IInviteeRes, ICheckedInviteeRes]) => {
      this.checkedInvitees$.next(res[1].verified_invitees ?? []);
      this.allInvitees$.next(res[0].visitors ?? []);
    };
    this.loadingService
      .beginLoading()
      .pipe(
        mergeMap((loading) =>
          zip(
            this.service.getAllInvitees(this.event_id),
            this.service.inviteeChecked(this.event_id)
          ).pipe(
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err))
          )
        ),
        filterNotNull()
      )
      .subscribe(success);
  }
  ngOnDestroy(): void {}
  scanVisitor(invitee: any) {
    const openSwal = (message: string, visitor_name: string) => {
      message = message.replace('{{}}', visitor_name);
      AppUtilities.confirmAction(message).then((result) => {
        result.isConfirmed && this.sendQr(invitee.qr_code);
      });
    };
    this.tr
      .get('tab3.sureRegisterVisitor')
      .pipe(this._unsubsriber.takeUntilDestroy)
      .subscribe({
        next: (message) => openSwal(message, invitee.visitor_name),
        error: (err) => console.error(err),
      });
  }
  sendQr(qrCode: string) {
    const erroneousRes = async (err: any) => {
      switch (err.error.message.toLocaleLowerCase()) {
        case 'Failed! Invitee does not exist.'.toLocaleLowerCase():
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform('verifyCode.form.errors.inviteeNotExist')
          );
          break;
        default:
          AppUtilities.showErrorMessage(
            '',
            this._trPipe.transform('verifyCode.form.errors.codeNotFound')
          );
          break;
      }
    };
    const success = (result: void | IReadQrCode) => {
      if (!result) return;
      const navigationExtras: NavigationExtras = {
        state: {
          qrinfo: result,
          qrcode: qrCode,
        },
      };
      this.router.navigate(['tabs/tab2/verifyuser'], navigationExtras);
    };
    const eventId = this.appConfig.getItemFromSessionStorage(
      AppUtilities.EVENT_ID
    );
    const body = { qr_code: qrCode, event_id: eventId };
    this.loadingService
      .beginLoading()
      .pipe(
        this._unsubsriber.takeUntilDestroy,
        mergeMap((loading) =>
          this.service.sendQr(body).pipe(
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err)),
            filterNotNull()
          )
        )
      )
      .subscribe(success);
  }
  getTableValue(invitee: any, index: number) {
    switch (index) {
      case InviteesTable.VISITOR_NAME:
        return invitee.visitor_name;
      case InviteesTable.MOBILE:
        return invitee.mobile_no;
      case InviteesTable.SIZE:
        return invitee.no_of_persons;
      case InviteesTable.TABLE:
        return invitee.table_number;
      default:
        return '';
    }
  }
  doRefresh(event: any) {
    this.requestInviteesList();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  addInvitees() {
    this.router.navigate(['registration']);
  }
  changepass() {
    this.router.navigate(['changepwd']);
  }
  switchEvent() {
    this.router.navigate(['switch']);
  }
}
