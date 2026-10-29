import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '@core/auth/auth';
import { internalDestination } from '@core/auth/auth.utils';
import { authInterceptor } from '@core/auth/http/auth.interceptor';
import { type FeatureFlags } from '@core/config/feature-flags.types';
import { provideTestAppConfig } from '@testing/test-config';
import { mockAuthInterceptor } from './mock-auth.interceptor';
import { clearMockSession, readMockSession } from './mock-session';

@Component({ template: '' })
class Empty {}

/** Real Auth + mock gateway + mock auth API: the whole cookie flow, without a backend. */
function configure(features: Partial<FeatureFlags> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideTestAppConfig({ features: { authentication: true, ...features } }),
      provideHttpClient(withInterceptors([authInterceptor, mockAuthInterceptor])),
      provideRouter([{ path: '**', component: Empty }]),
    ],
  });
  return TestBed.inject(Auth);
}

describe('Auth (mock mode, cookie session)', () => {
  beforeEach(() => clearMockSession());
  afterEach(() => clearMockSession());

  it('without a session cookie, nobody is signed in', async () => {
    const auth = configure();
    await auth.loadSession();
    expect(auth.authenticated()).toBe(false);
  });

  it('signIn creates the cookie, loads the user and goes back to the requested URL', async () => {
    const auth = configure();
    await auth.signIn('/produtos/HO-1', 'operator');

    expect(readMockSession()?.id).toBe('operator');
    expect(auth.user()?.name).toBe('Carlos Operador');
    expect(TestBed.inject(Router).url).toBe('/produtos/HO-1');
  });

  it('the session survives an "F5": a new Auth reads the same cookie', async () => {
    await configure().signIn('/inicio', 'admin');
    TestBed.resetTestingModule();

    const auth = configure();
    await auth.loadSession();
    expect(auth.user()?.name).toBe('Ana Admin');
  });

  it('signOut deletes the cookie and sends to the login', async () => {
    const auth = configure();
    await auth.signIn('/inicio', 'admin');
    await auth.signOut();

    expect(readMockSession()).toBeNull();
    expect(auth.authenticated()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('canAccess honors the role and the roleControl flag', async () => {
    const auth = configure();
    await auth.signIn('/inicio', 'customer');
    expect(auth.canAccess('admin')).toBe(false);
    expect(auth.canAccess('customer')).toBe(true);

    TestBed.resetTestingModule();
    const withoutRoles = configure({ roleControl: false });
    await withoutRoles.loadSession();
    expect(withoutRoles.canAccess('admin')).toBe(true);
  });

  it('with the authentication flag off it does not check the session and allows everything', async () => {
    const auth = configure({ authentication: false });
    await auth.loadSession();
    expect(auth.enabled).toBe(false);
    expect(auth.canAccess('admin')).toBe(true);
  });
});

describe('internalDestination (open redirect protection)', () => {
  it.each([
    ['/produtos?q=1', '/produtos?q=1'],
    ['https://scam.com', '/inicio'],
    ['//scam.com', '/inicio'],
    ['javascript:alert(1)', '/inicio'],
    [undefined, '/inicio'],
  ])('%s → %s', (input, expected) => {
    expect(internalDestination(input)).toBe(expected);
  });
});
