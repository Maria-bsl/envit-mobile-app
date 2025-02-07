import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { NavbarComponent } from 'src/app/components/layouts/navbar/navbar.component';
import { IonicModule, LoadingController, Platform } from '@ionic/angular';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
  BehaviorSubject,
  Subscription,
  from,
  zip,
  finalize,
  switchMap,
  Observable,
  tap,
  of,
  throwError,
  fromEvent,
} from 'rxjs';
import { AppUtilities } from 'src/app/core/utils/AppUtilities';
import { ServiceService } from 'src/app/services/service.service';
import {
  CheckedInviteesTable,
  CheckedInviteesTableKeys,
} from 'src/app/core/enums/checked-invitees-table';
import {
  inOutAnimation,
  listAnimationDesktop,
} from 'src/app/core/shared/fade-in-out-animation';
import { MatButtonModule } from '@angular/material/button';
import {
  Barcode,
  BarcodeScanner,
  GoogleBarcodeScannerModuleInstallState,
  IsGoogleBarcodeScannerModuleAvailableResult,
} from '@capacitor-mlkit/barcode-scanning';
import { MatGridListModule } from '@angular/material/grid-list';
import { AppConfigService } from 'src/app/services/App-Config/app-config.service';
import { UnsubscriberService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { StylePaginatorDirective } from 'src/app/core/directives/style-paginator.directive';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  animations: [inOutAnimation, listAnimationDesktop],
  imports: [
    NavbarComponent,
    CommonModule,
    MatSortModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    TranslateModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    StylePaginatorDirective,
  ],
  providers: [TranslatePipe],
})
export class Tab1Page implements OnInit, AfterViewInit, AfterViewChecked {
  barcodes: Barcode[] = [];
  isSupportedBarCode: boolean = false;
  isScanning: boolean = false;
  showingList: boolean = true;
  CheckedInviteesTable: typeof CheckedInviteesTable = CheckedInviteesTable;
  CheckedInviteesTableKeys: typeof CheckedInviteesTableKeys =
    CheckedInviteesTableKeys;
  displayedColumns: string[] = [
    CheckedInviteesTableKeys.VISITOR_NAME,
    CheckedInviteesTableKeys.SCANNED,
    CheckedInviteesTableKeys.TABLE_NUMBER,
    CheckedInviteesTableKeys.VERIFIED_BY,
  ];
  qrText: string = '';
  listOfInvitee: any;
  guestIn = 0;
  remains = 0;
  totalGuest = 0;
  totalVisitors$ = new BehaviorSubject<number>(0);
  eventname = this.appConfig.getItemFromSessionStorage(AppUtilities.EVENT_NAME);
  filterTerm = new FormControl('', []);
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  private readonly eventIDs = 'event_id';
  percen: any;
  percen2: any;
  inviteeArr: any;
  tableno: any;
  Highcharts: typeof Highcharts = Highcharts;
  updateFromInput = false;
  chart!: any;
  chartConstructor = 'chart';
  chartCallback!: any;
  chartOptions: Highcharts.Options = {
    credits: {
      enabled: false, //watch out for production
    },
    legend: {
      enabled: false,
    },
    title: {
      text: '0',
    },
    chart: {
      height: 150,
      width: 150,
      backgroundColor: 'transparent',
      style: {
        opacity: 1,
        borderRadius: 12,
      },
    },
    series: [],
  };
  isReadyChart = signal<boolean>(false);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private appConfig: AppConfigService,
    private service: ServiceService,
    private router: Router,
    public platform: Platform,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private tr: TranslateService,
    private _trPipe: TranslatePipe,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService,
    private sharedService: SharedService
  ) {
    const backButton = () => {
      const backToLogin = () => new Promise<void>((r, j) => r());
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
    this.registerIcons();
  }
  private barcodeScannerReadyEventListener() {
    BarcodeScanner.addListener(
      'googleBarcodeScannerModuleInstallProgress',
      async (e) => {
        const stateCompletedStrict =
          e.state === GoogleBarcodeScannerModuleInstallState.COMPLETED;
        const stateComplete =
          e.state == GoogleBarcodeScannerModuleInstallState.COMPLETED;
        if (stateComplete || stateCompletedStrict) {
          (await this.loadingService.isLoading()) &&
            this.loadingService.dismiss();
          this.scanCard();
        }
      }
    );
  }
  private scanCard() {
    BarcodeScanner.scan()
      .then((scanner) => {
        if (scanner.barcodes && scanner.barcodes.length > 0) {
          this.qrText = scanner.barcodes.at(0)?.displayValue ?? '';
          this.sendResult(this.qrText);
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  private pullToRefreshServiceHandler() {
    this.sharedService.pullToRefreshSource$
      .pipe(this._unsubscriber.takeUntilDestroy)
      .subscribe({
        next: () => this.requestInviteesList(),
        error: (err) => console.error(err),
      });
  }
  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  ngAfterViewChecked(): void {}
  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupportedBarCode = result.supported;
    });
    this.barcodeScannerReadyEventListener();
    this.requestInviteesList();
    this.pullToRefreshHandler();
    this.searchInviteesHandler();
    this.initVisitorsChart();
    this.pullToRefreshServiceHandler();
  }
  private initVisitorsChart() {
    const self = this;
    this.chartCallback = (chart: any) => {
      self.chart = chart;
    };
  }
  private pullToRefreshHandler() {
    this.service.refreshNeeded$
      .pipe(this._unsubscriber.takeUntilDestroy)
      .subscribe({
        next: () => this.requestInviteesList(),
        error: (err) => console.error('Failed to pull for refresh', err),
      });
  }
  private searchInviteesHandler() {
    const search = (searchText: string | null) => {
      this.dataSource.filter = searchText
        ? searchText.trim().toLocaleLowerCase()
        : '';
      if (this.paginator) {
        this.paginator.firstPage();
      }
    };

    this.filterTerm.valueChanges
      .pipe(this._unsubscriber.takeUntilDestroy)
      .subscribe({
        next: (searchText: string | null) => search(searchText),
        error: (err) => console.error(err),
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
    let bootstrapIcons = ['card-checklist', 'table'];
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
        : false;
    };
    this.dataSource.filterPredicate = filterPredicate;
  }
  private parseInviteeChecked(inviteeChecked: Object) {
    this.inviteeArr = inviteeChecked;
    this.listOfInvitee = this.inviteeArr.verified_invitees;
    for (let i = 0; i <= this.listOfInvitee; i++) {
      this.tableno = this.listOfInvitee[i].table_number;
    }
    this.guestIn = this.inviteeArr.number_of_verified_invitees;
    this.dataSource = new MatTableDataSource(this.listOfInvitee);
    this.dataSourceFilter();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  private parseGetAllInvitees(getAllinvitee: Object) {
    this.inviteeArr = getAllinvitee;
    this.totalGuest = this.inviteeArr.totalVisitor;
  }
  private updateChartOptions() {
    const self = this,
      chart = this.chart;
    self.chartOptions.title = {
      verticalAlign: 'middle',
      floating: true,
      text: `${this.totalGuest}`,
      style: {
        fontSize: '24px',
        color: 'var(--sys-shadow)',
        opacity: 1,
      },
    };
    self.chartOptions.series = [
      {
        type: 'pie',
        dataLabels: {
          connectorWidth: 0,
          enabled: false,
        },
        data: [
          {
            y: this.guestIn,
            color: '#2dd36f',
            name: this._trPipe.transform(
              'dashboardPage.topBanner.chart.checked'
            ),
            borderColor: 'transparent',
          },
          {
            y: this.remains,
            color: '#eb445a',
            name: this._trPipe.transform(
              'dashboardPage.topBanner.chart.unchecked'
            ),
            borderColor: 'transparent',
          },
        ],
        innerSize: '80%',
      },
    ];
    self.updateFromInput = true;
    this.isReadyChart.set(true);
  }
  private requestInviteesList() {
    this.loadingService.startLoading().then((loading) => {
      const eventId = this.appConfig.getItemFromSessionStorage(
        AppUtilities.EVENT_ID
      );
      let inviteeChecked$ = from(this.service.inviteeChecked(eventId));
      let getAllinvitee$ = from(this.service.getAllinvitee(eventId)!);
      let observables = zip(inviteeChecked$, getAllinvitee$);
      observables
        .pipe(
          this._unsubscriber.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res) => {
            let [inviteeChecked, getAllinvitee] = res;
            this.parseInviteeChecked(inviteeChecked);
            this.parseGetAllInvitees(getAllinvitee!);
            this.remains = this.totalGuest - this.guestIn;
            this.percen = (this.guestIn / this.totalGuest) * 100;
            this.percen2 = (this.remains / this.totalGuest) * 100;
            this.updateChartOptions();
          },
          error: (err) => {
            this.tr.get('defaults.errors.failed').subscribe({
              next: (message) => {
                AppUtilities.showErrorMessage('', message);
              },
            });
            throw err;
          },
        });
    });
  }
  private async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }
  getTableValue(invitee: any, index: number) {
    switch (index) {
      case CheckedInviteesTable.VISITOR_NAME:
        return invitee.visitor_name;
      case CheckedInviteesTable.SCANNED:
        return invitee.scan_status;
      case CheckedInviteesTable.TABLE_NUMBER:
        return invitee.table_number;
      case CheckedInviteesTable.VERIFIED_BY:
        return invitee.scanned_by;
      default:
        return '';
    }
  }
  startScanning() {
    this.requestPermissions()
      .then(async (granted) => {
        if (granted) {
          let isGoogleBarcodeScannerModuleAvailable = async () => {
            const { available } =
              await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
            return available;
          };

          if (await isGoogleBarcodeScannerModuleAvailable()) {
            this.scanCard();
          } else {
            this.loadingService.startLoading().then((loading) => {
              BarcodeScanner.installGoogleBarcodeScannerModule();
            });
          }
        } else {
          this.tr.get('dashboardPage.cameraPermissionDenied').subscribe({
            next: (message) => {
              AppUtilities.showErrorMessage('', message);
            },
          });
        }
      })
      .catch((err) => {
        this.tr
          .get('defaults.labels.cameraPermissionsDenied')
          .pipe(this._unsubscriber.takeUntilDestroy)
          .subscribe({
            next: (message) => AppUtilities.showErrorMessage('', message),
            error: (err) => console.error(err),
          });
      });
  }
  sendResult(qrText: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        result: qrText,
      },
    };
    this.router.navigate(['qrpage'], navigationExtras);
  }
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }
  getInviteeScanStatusColor(statusString: string): string {
    if (!statusString) return '';
    let fractionPart = statusString.split(' ')[0];
    let [numerator, denominator] = fractionPart.split('/').map(Number);
    return numerator === denominator
      ? 'complete-scan-status'
      : 'pending-scan-status';
  }
  changepass() {
    this.router.navigate(['changepwd']);
  }
  switchEvent() {
    this.router.navigate(['switch']);
  }
  onLanguageChanged() {
    this.updateChartOptions();
  }
  async doRefresh(event: any) {
    this.requestInviteesList();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
