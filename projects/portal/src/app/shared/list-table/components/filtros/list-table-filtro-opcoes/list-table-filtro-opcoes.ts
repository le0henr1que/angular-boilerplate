import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { injectListTableFilter } from '../../../hooks/inject-list-table-filter';
import { type CampoUrl } from '../../../models/campo-url';
import { idUnico } from '../../../utils/id-unico';

/**
 * Filtro de lista de opções, pronto para usar dentro da <app-list-table>:
 *
 *   <app-list-table-filtro-opcoes
 *     rotulo="Categoria" rotuloTodas="Todas"
 *     [filtro]="filtros.categoria" [opcoes]="categorias" />
 */
@Component({
  selector: 'app-list-table-filtro-opcoes',
  imports: [UiLabel, UiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label ui-label [for]="id">{{ rotulo() }}</label>
    <select ui-select [id]="id" (change)="aoMudar($event)">
      @if (rotuloTodas(); as todas) {
        <option [value]="filtro().padrao" [selected]="estado.valor() === filtro().padrao">
          {{ todas }}
        </option>
      }
      @for (opcao of opcoes(); track opcao) {
        <option [value]="opcao" [selected]="estado.valor() === opcao">
          {{ rotuloDaOpcao()(opcao) }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `,
})
export class ListTableFiltroOpcoes<V extends string> {
  readonly filtro = input.required<CampoUrl<V>>();
  readonly opcoes = input.required<readonly V[]>();
  readonly rotulo = input.required<string>();
  /** Texto da opção "sem filtro" (o padrão do filtro). Vazio = sem essa opção. */
  readonly rotuloTodas = input<string>();
  /** Texto de cada opção. Padrão: a própria opção. */
  readonly rotuloDaOpcao = input<(opcao: V) => string>(String);

  protected readonly estado = injectListTableFilter(this.filtro);
  protected readonly id = idUnico('list-table-filtro-opcoes');

  protected aoMudar(evento: Event) {
    // O próprio filtro converte o texto (e troca valor inválido pelo padrão).
    this.estado.definir(this.filtro().ler((evento.target as HTMLSelectElement).value));
  }
}
