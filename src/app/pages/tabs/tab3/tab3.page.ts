import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
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
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription, finalize, from } from 'rxjs';
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
    MatRippleModule,
  ],
})
export class Tab3Page implements OnInit, OnDestroy, AfterViewInit {
  subscriptions: Subscription[] = [];
  showingList: boolean = true;
  userInfo: any;
  listOfInvitee: any;
  guestIn: any;
  eventname: string = '';
  InviteesTable: typeof InviteesTable = InviteesTable;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  event_id: any;
  filterTerm: string = '';
  private readonly eventIDs = 'event_id';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly event_name = 'event_name';

  private readonly totalVisitor = 'totalVisitor';
  result: any;
  qrResponse: any;
  errMsg: any;
  resp: any;
  msg: any;
  inviteeArr: any;
  // eslint-disable-next-line max-len
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  tableLoading: boolean = false;
  searchInput: FormControl = new FormControl('', []);
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChildren('templateList', { read: ElementRef })
  templateListRef!: QueryList<ElementRef>;
  constructor(
    private service: ServiceService,
    private appConfig: AppConfigService,
    private router: Router,
    private animationCtrl: AnimationController,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private _unsubsriber: UnsubscriberService
  ) {
    addIcons({ addOutline });
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
    let filterPredicate = (data: any, filter: string) => {
      return data.visitor_name &&
        data.visitor_name
          .toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase())
        ? true
        : false ||
          (data.mobile_no &&
            data.mobile_no
              .toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()))
        ? true
        : false;
    };
    this.dataSource.filterPredicate = filterPredicate;
  }
  private searchInputChanged() {
    this.subscriptions.push(
      this.searchInput.valueChanges.subscribe({
        next: (searchText) => {
          this.dataSource.filter = searchText.trim().toLocaleLowerCase();
          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
      })
    );
  }
  ngOnInit() {
    this.registerIcons();
    this.requestInviteesList();
    this.searchInputChanged();
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
    this.eventname = localStorage.getItem(this.event_name)!;
    this.event_id = localStorage.getItem(this.eventIDs);
    const body = { event_id: this.event_id };
    this.appConfig.openLoading().then((loading) => {
      let native = from(this.service.getAllinvitee(body.event_id));
      native
        .pipe(
          this._unsubsriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.inviteeArr = res;
            this.listOfInvitee = this.inviteeArr.visitors;
            this.dataSource = new MatTableDataSource(this.listOfInvitee);
            this.tableLoading = false;
            this.dataSourceFilter();
          },
        });
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  scanVisitor(invitee: any) {
    let swal = AppUtilities.confirmAction(
      `Are you sure you want to verify ${invitee.visitor_name}.`
    );
    swal.then((result) => {
      if (result.isConfirmed) {
        this.sendQr(invitee.qr_code);
      }
    });
  }
  sendQr(qrcode: any) {
    const body = { qr_code: qrcode, event_id: this.event_id };
    this.appConfig.openLoading().then((loading) => {
      let native = from(this.service.sendQr(body));
      native
        .pipe(
          this._unsubsriber.takeUntilDestroy,
          finalize(() => loading.dismiss())
        )
        .subscribe({
          next: (res) => {
            this.result = res;
            this.qrResponse = this.result;
            if (this.result.message) {
              AppUtilities.showErrorMessage('', this.result.message);
            } else if (this.qrResponse) {
              const navigationExtras: NavigationExtras = {
                state: {
                  qrinfo: this.qrResponse,
                  qrcode: qrcode,
                },
              };
              this.router.navigate(['tabs/tab2/verifyuser'], navigationExtras);
            }
          },
          error: (error) => {
            this.errMsg = error;
            this.resp = this.errMsg.error;
            this.msg = this.resp.message;
            AppUtilities.showErrorMessage('', this.msg);
          },
        });
    });
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
  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
  switchEvent() {
    this.router.navigate(['switch']);
  }
}
