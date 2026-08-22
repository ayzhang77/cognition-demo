import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth-service';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start with no current user', () => {
    TestBed.createComponent(App);
    expect(TestBed.inject(AuthService).getCurrentUser()).toBeNull();
  });
});
