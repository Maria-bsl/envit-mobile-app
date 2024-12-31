import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    //StylePaginatorDirective,
  ],
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
  //scanSub: any;
  qrText: string = '';
  //userInfo: any;
  listOfInvitee: any;
  guestIn = 0;
  remains = 0;
  totalGuest = 0;
  totalVisitors$ = new BehaviorSubject<number>(0);
  eventname: string = localStorage.getItem(AppUtilities.EVENT_NAME)!;
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
    chart: {
      height: 200,
      width: 200,
      backgroundColor: '#ffffff',
      style: {
        opacity: 1,
        borderRadius: 12,
      },
    },
    series: [],
  };
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private appConfig: AppConfigService,
    private service: ServiceService,
    private router: Router,
    private route: ActivatedRoute,
    public platform: Platform,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private _unsubscriber: UnsubscriberService,
    private loadingService: LoadingService
  ) {
    this.registerIcons();
  }
  private barcodeScannerReadyEventListener() {
    BarcodeScanner.addListener(
      'googleBarcodeScannerModuleInstallProgress',
      (e) => {
        if (e.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) {
          if (this.appConfig.loading) {
            this.appConfig.loading.dismiss();
            this.appConfig.loading = null;
          }
          this.scanCard();
        } else if (e.progress && e.progress === 100) {
          if (this.appConfig.loading) {
            this.appConfig.loading.dismiss();
            this.appConfig.loading = null;
          }
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
    //this.barcodeScannerReadyEventListener();
    this.requestInviteesList();
    this.pullToRefreshHandler();
    this.searchInviteesHandler();
    this.initVisitorsChart();
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
    // iconRegistry.addSvgIcon(
    //   'list',
    //   sanitizer.bypassSecurityTrustResourceUrl('/assets/feather/list.svg')
    // );
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
    this.translate.get('dashboardPage.topBanner.chart').subscribe({
      next: (chartLabels) => {
        self.chartOptions.title = {
          verticalAlign: 'middle',
          floating: true,
          text: `${this.totalGuest}`,
          style: {
            fontSize: '24px',
            //color: '#ffffff',
            color: '#000000',
          },
        };
        (self.chartOptions.subtitle = {
          verticalAlign: 'middle',
          floating: true,
          text: chartLabels.total,
          y: 36,
          style: {
            fontSize: '16px',
            //color: '#f6f6f6',
            color: '#000000',
          },
        }),
          (self.chartOptions.series = [
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
                  name: chartLabels.checked,
                  borderColor: 'transparent',
                },
                {
                  y: this.remains,
                  color: '#eb445a',
                  name: chartLabels.unchecked,
                  borderColor: 'transparent',
                },
              ],
              innerSize: '80%',
            },
          ]);
      },
    });
    self.updateFromInput = true;
  }
  private requestInviteesList() {
    this.loadingService.startLoading().then((loading) => {
      const eventId = Number(localStorage.getItem(this.eventIDs));
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
            this.translate.get('defaults.errors.failed').subscribe({
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
    // const permissions = () => {
    //   return new Promise<boolean>((resolve, reject) => {
    //     BarcodeScanner.requestPermissions()
    //       .then(({ camera }) =>
    //         resolve(camera === 'granted' || camera === 'limited')
    //       )
    //       .catch((err) => reject(err));
    //   });
    // };

    // const isAvailable = () => {
    //   return new Promise<boolean>((resolve, reject) => {
    //     BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    //       .then(({ available }) => resolve(available))
    //       .catch((err) => reject(err));
    //   });
    // };

    // from(permissions()).pipe(
    //   this._unsubscriber.takeUntilDestroy,
    //   switchMap((allowed) => {
    //     if (allowed === null || allowed === false) {
    //       return throwError(() => new Error('Permission not granted'));
    //     }
    //     return from(isAvailable());
    //   }),
    //   tap((available) => {
    //     !available &&
    //       this.loadingService.startLoading().then((loading) => {
    //         BarcodeScanner.addListener(
    //           'googleBarcodeScannerModuleInstallProgress',
    //           (e) => {
    //             if (
    //               e.state === GoogleBarcodeScannerModuleInstallState.COMPLETED
    //             ) {
    //               this.loadingService.dismiss();
    //               from(isAvailable())
    //                 .pipe(this._unsubscriber.takeUntilDestroy)
    //                 .subscribe({
    //                   next: (available) => {},
    //                   error: (err) => console.error(err),
    //                 });
    //             } else if (e.progress && e.progress === 100) {
    //               this.loadingService.dismiss();
    //               from(isAvailable())
    //                 .pipe(this._unsubscriber.takeUntilDestroy)
    //                 .subscribe({
    //                   next: (available) => {},
    //                   error: (err) => console.error(err),
    //                 });
    //             }
    //           }
    //         );
    //         BarcodeScanner.installGoogleBarcodeScannerModule();
    //       });
    //   })
    // );

    this.requestPermissions().then(async (granted) => {
      if (granted) {
        let isGoogleBarcodeScannerModuleAvailable = async () => {
          const { available } =
            await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
          return available;
        };

        let installGoogleBarcodeScannerModule = async () => {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        };

        if (await isGoogleBarcodeScannerModuleAvailable()) {
          this.scanCard();
        } else {
          this.translate.get('defaults.labels.loadingPleaseWait').subscribe({
            next: async (message) => {
              let loading = this.appConfig.openLoadingWithMessageAndDuration(
                message,
                60000
              );
              await installGoogleBarcodeScannerModule();
              (await loading).dismiss();
              this.scanCard();
            },
          });
        }
      } else {
        this.translate.get('dashboardPage.cameraPermissionDenied').subscribe({
          next: (message) => {
            AppUtilities.showErrorMessage('', message);
          },
        });
      }
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
  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
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
