import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-supplier-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-list-page.html',
})
export default class SupplierListPage {}
