import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectProductFilters } from './inject-product-filters';

/** Minimal component only to give the hook an injection context (like a React hook test). */
@Component({ template: '' })
class Host {
  readonly f = injectProductFilters();
}

describe('injectProductFilters', () => {
  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'produtos', component: Host }])],
    });
    const harness = await RouterTestingHarness.create();
    const host = await harness.navigateByUrl(url, Host);
    return { hook: host.f, router: TestBed.inject(Router), harness };
  }

  it('reads the filters from the URL', async () => {
    const { hook } = await open('/produtos?q=banana&status=low');
    expect(hook.filters()).toEqual({ term: 'banana', status: 'low' });
    expect(hook.hasFilter()).toBe(true);
  });

  it('uses the defaults without query params', async () => {
    const { hook } = await open('/produtos');
    expect(hook.filters()).toEqual({ term: '', status: 'all' });
    expect(hook.hasFilter()).toBe(false);
  });

  it('ignores an invalid status typed in the URL', async () => {
    const { hook } = await open('/produtos?status=xyz');
    expect(hook.filters().status).toBe('all');
  });

  it('search() writes the term to the URL and keeps the status', async () => {
    const { hook, router, harness } = await open('/produtos?status=available');
    hook.search('  suco  ');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos?q=suco&status=available');
    expect(hook.filters()).toEqual({ term: 'suco', status: 'available' });
  });

  it('filterByStatus("all") removes the parameter from the URL', async () => {
    const { hook, router, harness } = await open('/produtos?q=banana&status=available');
    hook.filterByStatus('all');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos?q=banana');
  });

  it('clear() leaves the URL without filters', async () => {
    const { hook, router, harness } = await open('/produtos?q=banana&status=available');
    hook.clear();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/produtos');
    expect(hook.hasFilter()).toBe(false);
  });
});
