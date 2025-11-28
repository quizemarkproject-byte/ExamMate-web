import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { networkErrorInterceptor } from './network-error-interceptor';
describe('networkErrorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => networkErrorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
