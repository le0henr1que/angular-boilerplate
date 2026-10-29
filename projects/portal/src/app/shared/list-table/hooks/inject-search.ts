import { computed, DestroyRef, inject, linkedSignal } from '@angular/core';
import { type Params } from '@angular/router';
import { NO_VALUE } from '../models/list-table.constants';
import { textFilter } from '../utils/filter.utils';
import { fieldToParam, readField } from '../utils/url-field.utils';
import { type SearchConfig } from './hooks.types';
import { type UrlParams } from './inject-url-params';

/**
 * Search-as-you-type "hook": waits `debounceMs` without keystrokes before applying (so the API
 * isn't called on every letter) and, in that case, replaces history (typing doesn't fill "back").
 *
 * The field `text` follows the URL ("back", "Clear"), but doesn't erase the space the user is
 * typing when the URL comes back with the trimmed term.
 */
export function injectSearch(url: UrlParams, config: SearchConfig) {
  const field = textFilter(config.param);

  const applied = computed(() => {
    if (!config.enabled()) return NO_VALUE;
    return readField(field, url.read);
  });

  const text = linkedSignal<string, string>({
    source: applied,
    computation: (urlValue, previous) => {
      if (previous && previous.value.trim() === urlValue) return previous.value;
      return urlValue;
    },
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => clearTimeout(timer);
  inject(DestroyRef).onDestroy(cancel);

  const toParams = (value: string): Params => ({ [field.param]: fieldToParam(field, value) });

  return {
    /** Applied term (what goes to the API). */
    applied,
    /** Field text; may be ahead of the URL while the debounce runs. */
    text: text.asReadonly(),
    active: computed(() => applied() !== field.defaultValue),
    setText(value: string) {
      text.set(value);
      cancel();
      timer = setTimeout(
        () => config.apply(toParams(value), { replaceHistory: true }),
        config.debounceMs,
      );
    },
    /** Enter: applies right away, without waiting for the debounce. */
    applyNow() {
      cancel();
      config.apply(toParams(text()), {});
    },
    cancel,
    clearParams: (): Params => ({ [field.param]: null }),
  };
}
