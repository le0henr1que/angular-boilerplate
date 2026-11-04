import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiTabsImports } from '@supermercado/ui/tabs';
import { SUPPLIERS_TABS } from './suppliers-layout.constants';

/**
 * Shell of the suppliers area: title, tabs and the active tab's page (router-outlet).
 * Each tab is a route, so each list keeps its own search, filters and page in the URL.
 */
@Component({
  selector: 'app-suppliers-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UiTabsImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers-layout.html',
  styleUrl: './suppliers-layout.scss',
})
export default class SuppliersLayout {
  protected readonly tabs = SUPPLIERS_TABS;
}
