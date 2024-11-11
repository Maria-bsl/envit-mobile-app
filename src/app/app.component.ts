import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { ThemeManagerService } from './services/theme-manager/them-manager.service';
import { AppUtilities } from './core/utils/AppUtilities';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private themeManagerService: ThemeManagerService
  ) {}
  private checkIsLoggedInUser() {
    let userId = localStorage.getItem(AppUtilities.TOKEN_user);
    if (userId && userId.length > 0) {
      this.router.navigate(['tabs/dashboard']);
    }
  }
  ngOnInit(): void {
    this.checkIsLoggedInUser();
  }
}
