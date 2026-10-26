import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiTableImports } from '@supermercado/ui/table';
import { type Caminho, lerCaminho, type ValorEm } from './caminho';

/*
 * Tabela montada a partir dos dados e de uma lista de colunas (como a DataTable do React):
 *
 *   colunas: UiColuna<Pedido>[] = [
 *     { chave: 'user.name', titulo: 'Cliente' },
 *     { chave: 'total', titulo: 'Total', formatar: (v) => moeda(v), alinhar: 'direita' },
 *     { chave: 'status', titulo: 'Status' },
 *     { id: 'acoes', titulo: '' },                 // coluna que não vem do objeto
 *   ];
 *
 *   <ui-data-table [dados]="pedidos()" [colunas]="colunas">
 *     <ng-template uiCelula="status" let-valor let-linha="linha">
 *       <span ui-badge>{{ valor }}</span>
 *     </ng-template>
 *     <ng-template uiCelula="acoes" let-linha="linha">
 *       <button ui-button (click)="editar(linha)">Editar</button>
 *     </ng-template>
 *   </ui-data-table>
 *
 * O que aparece em cada célula: template uiCelula → formatar → valor puro.
 */

export type UiAlinhamento = 'esquerda' | 'centro' | 'direita';

interface ColunaBase {
  titulo: string;
  alinhar?: UiAlinhamento;
  /** Qualquer largura CSS: '8rem', '20%'… */
  largura?: string;
}

/** Coluna ligada a um valor do objeto. `formatar` recebe o valor já com o tipo certo. */
export type UiColunaDados<T, P extends Caminho<T> = Caminho<T>> = P extends Caminho<T>
  ? ColunaBase & {
      chave: P;
      /** Identificador usado pelo uiCelula/uiCabecalho. Padrão: a própria chave. */
      id?: string;
      formatar?: (valor: ValorEm<T, P>, linha: T) => unknown;
    }
  : never;

/** Coluna que não vem do objeto (ações, por exemplo): o conteúdo vem de um uiCelula. */
export type UiColunaExtra<T> = ColunaBase & {
  id: string;
  chave?: never;
  formatar?: (valor: undefined, linha: T) => unknown;
};

export type UiColuna<T> = UiColunaDados<T> | UiColunaExtra<T>;

export interface UiCelulaContexto {
  /** O valor no caminho da coluna (let-valor). */
  $implicit: any;
  /** O objeto inteiro da linha (let-linha="linha"). */
  linha: any;
  /** Posição da linha (let-i="indice"). */
  indice: number;
}

export interface UiCabecalhoContexto {
  /** A coluna (let-coluna). */
  $implicit: UiColuna<any>;
}

/** Troca o conteúdo das células de uma coluna: <ng-template uiCelula="status" let-valor let-linha="linha"> */
@Directive({ selector: 'ng-template[uiCelula]' })
export class UiCelula {
  readonly uiCelula = input.required<string>();
  readonly template = inject<TemplateRef<UiCelulaContexto>>(TemplateRef);

  static ngTemplateContextGuard(_dir: UiCelula, _ctx: unknown): _ctx is UiCelulaContexto {
    return true;
  }
}

/** Troca o título de uma coluna: <ng-template uiCabecalho="status" let-coluna> */
@Directive({ selector: 'ng-template[uiCabecalho]' })
export class UiCabecalho {
  readonly uiCabecalho = input.required<string>();
  readonly template = inject<TemplateRef<UiCabecalhoContexto>>(TemplateRef);

  static ngTemplateContextGuard(_dir: UiCabecalho, _ctx: unknown): _ctx is UiCabecalhoContexto {
    return true;
  }
}

const ALINHAMENTO: Record<UiAlinhamento, string> = {
  esquerda: 'start',
  centro: 'center',
  direita: 'end',
};

@Component({
  selector: 'ui-data-table',
  imports: [NgTemplateOutlet, UiTableImports, UiSkeleton],
  template: `
    <div ui-table-container>
      <table ui-table>
        <thead ui-thead>
          <tr ui-tr>
            @for (coluna of colunas(); track idDe(coluna)) {
              <th
                ui-th
                scope="col"
                [style.text-align]="alinhamento(coluna)"
                [style.width]="coluna.largura"
              >
                @if (cabecalhos().get(idDe(coluna)); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{ $implicit: coluna }"
                  />
                } @else {
                  {{ coluna.titulo }}
                }
              </th>
            }
          </tr>
        </thead>

        <tbody ui-tbody [attr.aria-busy]="carregando() || null">
          @if (carregando()) {
            @for (i of linhasEsqueleto(); track i) {
              <tr ui-tr>
                @for (coluna of colunas(); track idDe(coluna)) {
                  <td ui-td><ui-skeleton /></td>
                }
              </tr>
            }
          } @else {
            @for (linha of dados(); track rastrear(linha, i); let i = $index) {
              <tr ui-tr>
                @for (coluna of colunas(); track idDe(coluna)) {
                  <td ui-td [style.text-align]="alinhamento(coluna)">
                    @if (celulas().get(idDe(coluna)); as template) {
                      <ng-container
                        [ngTemplateOutlet]="template"
                        [ngTemplateOutletContext]="{
                          $implicit: valor(linha, coluna),
                          linha: linha,
                          indice: i,
                        }"
                      />
                    } @else {
                      {{ texto(linha, coluna) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr ui-tr>
                <td ui-td class="vazio" [attr.colspan]="colunas().length">
                  {{ mensagemVazia() }}
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .vazio {
      padding: calc(var(--space) * 6) calc(var(--space) * 2);
      color: var(--muted-foreground);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDataTable<T> {
  readonly dados = input.required<readonly T[]>();
  readonly colunas = input.required<readonly UiColuna<T>[]>();
  /** Mostra linhas de esqueleto no lugar dos dados. */
  readonly carregando = input(false, { transform: booleanAttribute });
  /** Quantas linhas de esqueleto mostrar enquanto carrega. */
  readonly linhasCarregando = input(5);
  readonly mensagemVazia = input('Nenhum registro encontrado.');
  /**
   * Identidade de cada linha, para o Angular reaproveitar o DOM.
   * Caminho ('codigo') ou função. Padrão: a propriedade "id"; sem ela, a posição.
   */
  readonly rastrearPor = input<Caminho<T> | ((linha: T) => unknown)>();

  private readonly templatesCelula = contentChildren(UiCelula);
  private readonly templatesCabecalho = contentChildren(UiCabecalho);

  protected readonly celulas = computed(
    () => new Map(this.templatesCelula().map((c) => [c.uiCelula(), c.template])),
  );
  protected readonly cabecalhos = computed(
    () => new Map(this.templatesCabecalho().map((c) => [c.uiCabecalho(), c.template])),
  );
  protected readonly linhasEsqueleto = computed(() =>
    Array.from({ length: this.linhasCarregando() }, (_, i) => i),
  );

  protected idDe(coluna: UiColuna<T>): string {
    return coluna.id ?? (coluna.chave as string);
  }

  protected alinhamento(coluna: UiColuna<T>): string | null {
    return coluna.alinhar ? ALINHAMENTO[coluna.alinhar] : null;
  }

  protected valor(linha: T, coluna: UiColuna<T>): unknown {
    return coluna.chave ? lerCaminho(linha, coluna.chave) : undefined;
  }

  protected texto(linha: T, coluna: UiColuna<T>): unknown {
    const valor = this.valor(linha, coluna);
    const formatar = coluna.formatar as ((valor: unknown, linha: T) => unknown) | undefined;
    return formatar ? formatar(valor, linha) : (valor ?? '');
  }

  protected rastrear(linha: T, indice: number): unknown {
    const rastrearPor = this.rastrearPor();
    if (typeof rastrearPor === 'function') return rastrearPor(linha);
    return lerCaminho(linha, rastrearPor ?? 'id') ?? indice;
  }
}
