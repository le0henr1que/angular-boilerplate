import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectTheme } from './inject-theme';

@Component({ template: '' })
class Host {
  readonly theme = injectTheme();
}

const STORAGE_KEY = 'supermercado:theme';

describe('injectTheme', () => {
  let html: HTMLElement;

  /** Simulates the operating system's theme preference. */
  function systemPrefersDark(dark: boolean) {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: dark } as MediaQueryList));
  }

  function create() {
    const fixture = TestBed.createComponent(Host);
    TestBed.tick(); // runs the effect that applies the class
    return fixture.componentInstance.theme;
  }

  beforeEach(() => {
    localStorage.clear();
    html = TestBed.inject(DOCUMENT).documentElement;
    html.classList.remove('dark');
    systemPrefersDark(false);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('follows the system preference when nothing is saved', () => {
    systemPrefersDark(true);
    const theme = create();
    expect(theme.theme()).toBe('dark');
    expect(html).toHaveClass('dark');
  });

  it('the saved choice takes priority over the system', () => {
    systemPrefersDark(true);
    localStorage.setItem(STORAGE_KEY, 'light');
    const theme = create();
    expect(theme.theme()).toBe('light');
    expect(html).not.toHaveClass('dark');
  });

  it('toggle() switches the theme, the <html> class and saves the choice', () => {
    const theme = create();
    expect(theme.theme()).toBe('light');

    theme.toggle();
    TestBed.tick();
    expect(theme.theme()).toBe('dark');
    expect(html).toHaveClass('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    theme.toggle();
    TestBed.tick();
    expect(html).not.toHaveClass('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('ignores an invalid value in storage', () => {
    localStorage.setItem(STORAGE_KEY, 'purple');
    expect(create().theme()).toBe('light');
  });

  it('keeps working if storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const theme = create();
    expect(() => {
      theme.toggle();
      TestBed.tick();
    }).not.toThrow();
    expect(html).toHaveClass('dark');
    vi.restoreAllMocks();
  });
});
