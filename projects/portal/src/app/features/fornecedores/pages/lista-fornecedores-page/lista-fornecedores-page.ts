import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-lista-fornecedores-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lista-fornecedores-page.html',
})
export default class ListaFornecedores {}
