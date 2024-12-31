import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SplashScreenPageComponent } from './splash-screen-page.component';

describe('SplashScreenPageComponent', () => {
  let component: SplashScreenPageComponent;
  let fixture: ComponentFixture<SplashScreenPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SplashScreenPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreenPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
