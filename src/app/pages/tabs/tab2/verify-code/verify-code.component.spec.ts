import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VerifyCodeComponent } from './verify-code.component';

describe('VerifyCodeComponent', () => {
  let component: VerifyCodeComponent;
  let fixture: ComponentFixture<VerifyCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VerifyCodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
