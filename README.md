# supermercado

Workspace Angular 22 com:

- **portal**: o app (consulta de produtos).
- **ui**: biblioteca de componentes **feita à mão** (só Angular + CSS, sem bibliotecas de estilo).
- **storybook**: o catálogo desses componentes.

## Começando

```bash
npm install
npm start                # app em http://localhost:4200
npm run storybook        # catálogo de componentes em http://localhost:6006
```

| Comando                   | O que faz                                                     |
| ------------------------- | ------------------------------------------------------------- |
| `npm start`               | Portal em modo desenvolvimento (com a API simulada ligada)    |
| `npm run storybook`       | Storybook em modo desenvolvimento (recarrega ao salvar)       |
| `npm run build`           | Compila a biblioteca (`dist/ui`) e o portal (`dist/portal`)   |
| `npm run build-storybook` | Gera o Storybook estático em `dist/storybook`                 |
| `npm run lint`            | ESLint (fronteiras + proíbe bibliotecas de estilo)            |
| `npm run format`          | Prettier                                                      |
| `npm run verify`          | Tudo que o CI roda: formato, lint, build e build do Storybook |

## Estrutura

```
projects/
  portal/src/
    app/
      app.config.ts          providers: rotas, HttpClient, TanStack Query, locale pt-BR
      app.routes.ts          rotas (todas as telas carregam sob demanda)
      core/                  usado pelo app inteiro: config, layout (header, 404), tema
      features/
        inicio/              página inicial (resumo)
        produtos/
          index.ts           API pública da feature (o que outras partes podem importar)
          produtos.routes.ts rotas da feature: lista e detalhe
          models/            tipos
          data-access/       API, cache (TanStack Query) e "hooks" (inject*)
          pages/             telas (lista, detalhe)
          ui/                componentes de apresentação (só input/output)
    environments/            configuração por ambiente (lida via inject(APP_CONFIG))
    mocks/                   API simulada (só em desenvolvimento)
  ui/                        a biblioteca (@supermercado/ui)
    button/                  um componente = um ponto de entrada próprio
      src/index.ts           o que o componente expõe para fora
      src/lib/ui-button.ts   o componente (Angular puro)
      src/lib/ui-button.css  o visual (CSS puro, só com as variáveis do tema)
      ng-package.json        faz deste diretório um subpacote
    icon/src/lib/icones.ts   ícones SVG desenhados à mão
    styles/supermercado.css    o TEMA: variáveis CSS de cores, raio, fontes, claro/escuro
  storybook/
    .storybook/              configuração do Storybook
    stories/                 uma história por componente
```

## Dados no portal: TanStack Query + "hooks"

As chamadas à API usam o [TanStack Query](https://tanstack.com/query) (`@tanstack/angular-query-experimental`),
o mesmo do React. A lógica fica em funções `inject*()`, que são os "hooks" do Angular:

| React                         | Aqui                                             |
| ----------------------------- | ------------------------------------------------ |
| `useQuery({ queryKey, ... })` | `injectQuery(() => ({ queryKey, ... }))`         |
| `useProdutos(filtros)`        | `injectProdutos(filtros)`                        |
| `useSearchParams` p/ filtros  | `injectFiltrosProdutos()` (filtros ficam na URL) |
| `useIsFetching()`             | `injectIsFetching()` (spinner do header)         |
| `data`, `isPending` (valores) | `query.data()`, `query.isPending()` (signals)    |

Assim como os hooks, os `inject*()` só podem ser chamados na criação do componente
(inicializador de campo ou constructor).

- **Cache:** cada combinação de filtros tem uma chave (`['produtos', 'lista', filtros]`).
  Por 1 minuto o dado é considerado "fresco" e voltar a uma tela não chama a API de novo.
  O Início e a lista sem filtros usam a mesma chave, então compartilham o cache.
- **Pré-carregamento:** passar o mouse no código do produto já busca o detalhe.
- **Devtools:** em desenvolvimento, o botão flutuante no canto da tela abre o painel do TanStack,
  que mostra o que está no cache.

### API simulada

Em desenvolvimento (`mockApi: true` no `environment.development.ts`), o interceptor em
`projects/portal/src/mocks` responde a `/api/*` com 800 ms de atraso. As chamadas aparecem no
console como `[mock-api] GET ...`. Quando o backend existir, coloque `mockApi: false` e o
`apiUrl` certo nos environments, e apague a pasta `mocks/`.

## Como os componentes funcionam

Não há nenhuma biblioteca de estilo ou de componentes (nada de Tailwind, Spartan, Material,
CDK ou bibliotecas de ícones). O lint bloqueia esses imports.

- Cada componente é um `@Component` com seletor de atributo aplicado ao elemento nativo
  (`<button ui-button>`, `<table ui-table>`, `<input ui-input>`). Assim o HTML continua
  semântico e acessível, e o componente só cuida do visual.
- O visual fica no CSS do próprio componente, com `:host`. Variantes viram atributos
  `data-*` (`[attr.data-variant]`) e o CSS reage a eles: `:host([data-variant='outline'])`.
- As cores, raios e fontes vêm só de variáveis CSS do tema (`var(--primary)`).
- Quando um componente precisa posicionar conteúdo projetado (ex.: o ícone dentro do
  `ui-alert`), ele usa `ViewEncapsulation.None` e todas as regras começam pelo próprio seletor.

Componentes disponíveis: `alert`, `badge`, `button`, `card`, `empty`, `icon`, `input`
(e input group), `label`, `select`, `skeleton`, `spinner`, `table`.

## Usando num app

```ts
import { UiButton } from '@supermercado/ui/button';

@Component({
  imports: [UiButton],
  template: `<button ui-button variant="outline">Salvar</button>`,
})
```

No `styles.css` do app:

```css
@import '@supermercado/ui/styles/supermercado.css';
```

## Mudando a identidade visual

Edite as variáveis em `projects/ui/styles/supermercado.css` (`--primary`, `--radius`, etc.).
Os componentes só usam os nomes (`var(--primary)`), então mudar a variável muda tudo de uma
vez, no tema claro (`:root`) e no escuro (`.dark`).

## Criando um componente novo

1. Crie `projects/ui/<nome>/ng-package.json` com `{ "lib": { "entryFile": "src/index.ts" } }`.
2. Crie `src/lib/ui-<nome>.ts` (+ `.css`) usando só as variáveis do tema.
3. Exporte em `src/index.ts`.
4. Crie a história em `projects/storybook/stories/<nome>.stories.ts`.
5. Rode `npm run verify`.

O passo a passo completo do ambiente está em [docs/ambiente-storybook.md](docs/ambiente-storybook.md).

Outros guias:

- [docs/configurar-testes.md](docs/configurar-testes.md): Vitest + Angular Testing Library
- [docs/roteamento.md](docs/roteamento.md): rotas com gates, lazy load e performance de render
- [docs/autenticacao-cookie.md](docs/autenticacao-cookie.md): login por cookie (mock hoje, Azure AD depois) e feature flags
