# Mudanças: header, tokens de cor e breakpoints

Resumo do que foi alterado no projeto e de como usar. Build (`ng build portal`) e testes
(`ng test portal`: 26 arquivos, 150 testes) passaram depois das mudanças.

## 1. Header com HTML e CSS separados

O `AppHeader` tinha o template e os estilos inline no `.ts`. Agora segue o mesmo padrão do
`lista-produtos-page` (um arquivo por responsabilidade).

| Arquivo                                                 | O que tem                                             |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `projects/portal/src/app/core/layout/header/header.ts`   | Só a classe; `templateUrl` e `styleUrl` apontam para os arquivos abaixo |
| `projects/portal/src/app/core/layout/header/header.html` | O template (sem mudança de conteúdo)                 |
| `projects/portal/src/app/core/layout/header/header.css`  | Os estilos (sem mudança de conteúdo)                 |

```ts
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UiButton, UiIcon, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
```

### Cuidados ao separar um template

- `@if`, `@for` e bindings funcionam igual no `.html`; a sintaxe não muda.
- O HTML só enxerga o que existe **na classe do próprio componente**. Copiar um template para
  outro componente sem levar as propriedades dá `ctx.algo is not a function` (ex.:
  `ctx.links is not a function`) no console.
- Só leva `()` no template o que é `signal`, `computed`, `input` ou método
  (`auth.usuario()`). Valores comuns vão sem parênteses (`appName`, `auth.ativa`).
- Componentes usados no HTML (`ui-button`, `ui-icon`...) precisam estar no `imports` do
  `@Component`.
- Erros vermelhos só no editor (build funciona): instale a extensão **Angular Language Service**
  (`angular.ng-template`).

## 2. Tokens de cor (globais)

As cores já eram globais e continuam no mesmo lugar:
**`projects/ui/styles/supermercado.css`**, importado por `projects/portal/src/styles.css`.

- `:root { ... }` → tema claro
- `.dark { ... }` → tema escuro (classe `dark` no `<html>`)

Para criar um token novo, declare nos **dois** blocos:

```css
:root {
  --sucesso: oklch(0.6 0.15 150);
}
.dark {
  --sucesso: oklch(0.7 0.15 150);
}
```

E use em qualquer componente: `background: var(--sucesso);`.

A única mudança nesse arquivo foi um comentário apontando para os breakpoints.

## 3. Breakpoints (globais, em SCSS)

`var()` não funciona dentro de `@media`, por isso os breakpoints não podem ser variáveis CSS.
Ficaram num mapa Sass com o mixin `b2b-breakpoint`.

### Arquivo: `projects/ui/styles/_responsive.scss`

| Breakpoint | Tela      |
| ---------- | --------- |
| `xs`       | >= 360px  |
| `sm`       | >= 480px  |
| `md`       | >= 768px  |
| `lg`       | >= 960px  |
| `xl`       | >= 1024px |
| `xxl`      | >= 1280px |
| `3xl`      | >= 1366px |
| `4xl`      | >= 1440px |

```scss
$breakpoints: (
  'xs': 360px,
  'sm': 480px,
  'md': 768px,
  'lg': 960px,
  'xl': 1024px,
  'xxl': 1280px,
  '3xl': 1366px,
  '4xl': 1440px,
);
```

O 1280px se chama **`xxl`** no mapa (na tabela de referência aparece como "2xl"): no código,
use `'xxl'`.

Mixin `b2b-breakpoint($nome)`, mobile-first (gera `@media (min-width: ...)`). Um nome inexistente
quebra o build com a lista dos válidos.

> Este arquivo substituiu o `_breakpoints.scss` (mixin `acima-de`, em rem), que foi removido.

### `angular.json`

No build do `portal` (`projects.portal.architect.build.options`):

```json
"stylePreprocessorOptions": {
  "includePaths": ["projects/ui/styles"]
}
```

É o que permite `@use 'responsive'` sem caminho relativo. O `ng test` herda essa configuração.

### Arquivos que usam os breakpoints

Os dois lugares que tinham `@media (min-width: 40rem)` escrito à mão foram migrados para SCSS:

| Antes                                                      | Depois                       |
| ---------------------------------------------------------- | ---------------------------- |
| `features/produtos/pages/lista-produtos-page/lista-produtos-page.css`   | `lista-produtos-page.scss`   |
| `features/produtos/pages/detalhe-produto-page/detalhe-produto-page.css` | `detalhe-produto-page.scss`  |

Em cada um: o `styleUrl` do `.ts` aponta para o `.scss`, há `@use 'responsive' as *;` no topo
e o `@media` virou `@include b2b-breakpoint('md')`.

**Mudança de comportamento:** antes o corte era em 640px (40rem), que não existe na nova
escala. Foi usado `md` (768px), porque em 480px os filtros da lista de produtos (busca + status +
botões) ficam apertados demais. Entre 640px e 767px essas duas telas agora usam o layout de uma
coluna.

### Como usar num componente

1. Use `.scss` no `styleUrl` (os demais componentes podem continuar `.css`).
2. No arquivo:

```scss
@use 'responsive' as *;

.grade {
  display: grid;

  @include b2b-breakpoint('md') {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

Não há constante de breakpoints em TypeScript (nada no app precisa hoje e duplicaria os
valores). Se precisar, crie `core/layout/breakpoints.ts` com os mesmos valores do SCSS.

## 4. Diagnóstico do login com MSAL (sem mudança de código)

Ficou registrado aqui o que foi verificado sobre o erro "Não foi possível entrar" (`/erro-login`):

- `/erro-login` é a **proteção contra loop** (`core/auth/auth.ts`, `irParaLogin`): voltou do
  login sem usuário em menos de 10 s. O erro real é logado antes.
- **"não foi possível consultar a sessão" + `SyntaxError` / `Http failure during parsing`** vem
  do `BffAuthGateway` (`core/auth/gateways/bff-auth-gateway.ts`), não do MSAL: o app estava em
  `modo: 'mock'` ou `'bff'` e o `GET /bff/user` recebeu o `index.html`. Confira
  `auth.modo: 'msal'` no environment que está rodando (`environment.development.ts` no
  `ng serve`).
- No modo `msal` o erro aparece como `[auth] não foi possível concluir o login na Microsoft`,
  com `errorCode` em `detalhes da falha no login`.

Para ver os logs: DevTools → Console com **Preserve log** e o nível **Verbose** ligados
(`console.debug` fica oculto por padrão no Chrome), e `log.nivel: 'debug'` no environment
(em produção: `supermercadoLog.nivel('debug')` no console).

| Código          | Causa provável                                            |
| --------------- | --------------------------------------------------------- |
| `AADSTS9002326` | Redirect URI cadastrada como **Web** em vez de **SPA**    |
| `AADSTS50011`   | Redirect URI diferente da cadastrada (porta, barra final) |
| `AADSTS65001`   | Scope da API sem consentimento / inexistente              |
| `AADSTS50105`   | Usuário não atribuído ao app                              |

Mais detalhes em `docs/autenticacao-msal.md`.
