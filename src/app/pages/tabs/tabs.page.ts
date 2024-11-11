import { HttpClient } from '@angular/common/http';
import {
  Component,
  EnvironmentInjector,
  importProvidersFrom,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { home, scan, people } from 'ionicons/icons';
import { createTranslateLoader } from 'src/main';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    RouterLink,
    TranslateModule,
  ],
})
export class TabsPage {
  constructor(
    public environmentInjector: EnvironmentInjector,
    private tr: TranslateService
  ) {
    addIcons({ home, scan, people });
  }
}
