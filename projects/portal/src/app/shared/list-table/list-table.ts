import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { type Params } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import {
  type Caminho,
  UiCabecalho,
  UiCelula,
  UiDataTableImports,
} from '@supermercado/ui/data-table';
import { type IconName, UiIcon } from '@supermercado/ui/icon';
import { UiSpinner } from '@supermercado/ui/spinner';
import { ListTableBusca } from './components/list-table-busca/list-table-busca';
import { ListTableCabecalhoOrdenavel } from './components/list-table-cabecalho-ordenavel/list-table-cabecalho-ordenavel';
import { ListTableRodape } from './components/list-table-rodape/list-table-rodape';
import { injectBusca } from './hooks/inject-busca';
import { injectFiltros } from './hooks/inject-filtros';
import { injectListQuery } from './hooks/inject-list-query';
import { injectOrdenacao } from './hooks/inject-ordenacao';
import { injectPaginacao } from './hooks/inject-paginacao';
import { injectParametrosUrl } from './hooks/inject-parametros-url';
import { LIST_TABLE_CONFIG } from './list-table.config';
import {
  LIST_TABLE_CONTEXTO,
  type ListTableContexto,
  type OpcoesDeAplicacao,
} from './list-table.context';
import { type CampoUrl, type CamposUrl, lerCampo, textoDoCampo } from './models/campo-url';
import {
  idDaColuna,
  type ListTableColuna,
  type ListTableFonte,
  type ListTableRequisicao,
  type Ordenacao,
} from './models/list-table.models';

const ICONE_ERRO: IconName = 'circle-alert';

/** Sem filtros específicos: só busca, ordenação e paginação. */
const SEM_FILTROS = {};

/**
 * Listagem completa vinda da API: busca, filtros, ordenação, paginação, estados (carregando,
 * atualizando, vazio, erro) e cache. Já vem com busca, ordenação e paginação; a tela informa
 * só a fonte dos dados, as colunas e os filtros específicos dela.
 *
 *   <app-list-table [fonte]="fonte" [colunas]="colunas" [filtros]="filtros">
 *     <!-- children: os controles dos filtros específicos -->
 *     <app-list-table-filtro-opcoes rotulo="Status" [filtro]="filtros.status" [opcoes]="status" />
 *
 *     <!-- células e cabeçalhos especiais, repassados ao ui-data-table -->
 *     <ng-template uiCelula="total" let-total>{{ total | currency: 'BRL' }}</ng-template>
 *   </app-list-table>
 *
 * Ligar/desligar: [busca]="false", [ordenacao]="false", [paginacao]="false".
 * O estado mora na URL (?q=&pagina=&porPagina=&ordenarPor=&direcao= + filtros): recarregar ou
 * compartilhar o link mantém tudo, e o "voltar" desfaz a última mudança.
 *
 * Filtros novos: crie um componente que chama injectListTableFilter(campo) e coloque como child.
 */
@Component({
  selector: 'app-list-table',
  imports: [
    ListTableBusca,
    ListTableCabecalhoOrdenavel,
    ListTableRodape,
    NgTemplateOutlet,
    UiAlertImports,
    UiButton,
    UiDataTableImports,
    UiIcon,
    UiSpinner,
  ],
  // Os filtros projetados (children) injetam este contexto para ler e gravar seus valores.
  providers: [{ provide: LIST_TABLE_CONTEXTO, useExisting: forwardRef(() => ListTable) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-table.html',
  styleUrl: './list-table.scss',
})
export class ListTable<T, F extends object = Record<never, never>> implements ListTableContexto {
  private readonly config = inject(LIST_TABLE_CONFIG);
  protected readonly textos = this.config.textos;
  protected readonly iconeErro = ICONE_ERRO;

  // ── Entradas ──
  readonly fonte = input.required<ListTableFonte<T, F>>();
  readonly colunas = input.required<readonly ListTableColuna<T>[]>();
  /** Filtros específicos da tela (ver models/filtros.ts). */
  readonly filtros = input<CamposUrl<F>>(SEM_FILTROS as CamposUrl<F>);
  readonly busca = input(true, { transform: booleanAttribute });
  readonly ordenacao = input(true, { transform: booleanAttribute });
  readonly paginacao = input(true, { transform: booleanAttribute });
  /** Ordenação quando a URL não tem nenhuma. */
  readonly ordenacaoPadrao = input<Ordenacao | null>(null);
  readonly opcoesPorPagina = input<readonly number[]>(this.config.opcoesPorPagina);
  readonly placeholderBusca = input(this.textos.buscaPlaceholder);
  readonly mensagemVazia = input(this.textos.vazio);
  readonly tituloErro = input(this.textos.erroTitulo);
  /** Identidade de cada linha (repassada ao ui-data-table). */
  readonly rastrearPor = input<Caminho<T> | ((linha: T) => unknown)>();

  // ── Templates da tela, repassados ao ui-data-table (ele não os vê pelo <ng-content>) ──
  protected readonly celulas = contentChildren(UiCelula);
  private readonly cabecalhosDaTela = contentChildren(UiCabecalho);

  protected readonly colunasOrdenaveis = computed(() => {
    if (!this.ordenacao()) return [];
    return this.colunas()
      .filter((coluna) => coluna.ordenavel)
      .map((coluna) => ({ id: idDaColuna(coluna), titulo: coluna.titulo }));
  });
  /** O cabeçalho de uma coluna ordenável é o botão de ordenar; os demais vêm da tela. */
  protected readonly cabecalhos = computed(() => {
    const ordenaveis = new Set(this.colunasOrdenaveis().map((coluna) => coluna.id));
    return this.cabecalhosDaTela().filter((cabecalho) => !ordenaveis.has(cabecalho.uiCabecalho()));
  });

  // ── Hooks (estado na URL) ──
  private readonly url = injectParametrosUrl();
  private readonly estadoFiltros = injectFiltros(this.filtros, this.url);
  protected readonly estadoBusca = injectBusca(this.url, {
    param: this.config.params.busca,
    habilitada: this.busca,
    debounceMs: this.config.debounceMs,
    aplicar: (params, opcoes) => this.navegarParaPrimeiraPagina(params, opcoes),
  });
  protected readonly estadoPaginacao = injectPaginacao(this.url, {
    paramPagina: this.config.params.pagina,
    paramPorPagina: this.config.params.porPagina,
    habilitada: this.paginacao,
    opcoesPorPagina: this.opcoesPorPagina,
  });
  protected readonly estadoOrdenacao = injectOrdenacao(this.url, {
    paramCampo: this.config.params.ordenarPor,
    paramDirecao: this.config.params.direcao,
    habilitada: this.ordenacao,
    campos: () => this.colunasOrdenaveis().map((coluna) => coluna.id),
    padrao: this.ordenacaoPadrao,
  });

  /** Tudo o que a fonte recebe. Também é a chave do cache. */
  readonly requisicao = computed<ListTableRequisicao<F>>(() => ({
    filtros: this.estadoFiltros.valores(),
    busca: this.estadoBusca.aplicada(),
    paginacao: this.estadoPaginacao.estado(),
    ordenacao: this.estadoOrdenacao.estado(),
  }));

  protected readonly consulta = injectListQuery(this.fonte, this.requisicao);

  readonly temFiltro = computed(() => this.estadoFiltros.ativo() || this.estadoBusca.ativa());

  // ── API pública (contexto dos filtros e uso por template ref: #lista) ──

  valorDoFiltro<V>(campo: CampoUrl<V>): V {
    return lerCampo(campo, this.url.ler);
  }

  aplicarFiltro<V>(campo: CampoUrl<V>, valor: V, opcoes?: OpcoesDeAplicacao): void {
    this.navegarParaPrimeiraPagina({ [campo.param]: textoDoCampo(campo, valor) }, opcoes);
  }

  /** Vários filtros de uma vez, com tipo: lista.aplicarFiltros({ status: 'pago' }). */
  aplicarFiltros(mudancas: Partial<F>, opcoes?: OpcoesDeAplicacao): void {
    this.navegarParaPrimeiraPagina(this.estadoFiltros.paraParams(mudancas), opcoes);
  }

  limparFiltros(): void {
    this.estadoBusca.cancelar();
    this.navegarParaPrimeiraPagina({
      ...this.estadoFiltros.paramsDeLimpeza(),
      ...this.estadoBusca.paramsDeLimpeza(),
    });
  }

  recarregar(): void {
    this.consulta.refetch();
  }

  // ── Eventos do template ──

  protected aoPesquisar(evento: SubmitEvent) {
    evento.preventDefault(); // sem isso o navegador recarregaria a página
    this.estadoBusca.aplicarAgora();
  }

  protected ordenarPor(campo: string) {
    this.navegarParaPrimeiraPagina(this.estadoOrdenacao.paramsDoClique(campo));
  }

  protected irParaPagina(pagina: number) {
    this.url.escrever(this.estadoPaginacao.paramsDaPagina(pagina));
  }

  protected mudarPorPagina(porPagina: number) {
    this.url.escrever(this.estadoPaginacao.paramsDePorPagina(porPagina));
  }

  /** Qualquer mudança no resultado (filtro, busca, ordenação) volta para a 1ª página. */
  private navegarParaPrimeiraPagina(params: Params, opcoes?: OpcoesDeAplicacao) {
    this.url.escrever({ ...params, ...this.estadoPaginacao.paramsDaPrimeiraPagina() }, opcoes);
  }
}
