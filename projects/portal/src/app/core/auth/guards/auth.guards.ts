import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { Auth } from '../auth';
import { type Papel } from '../usuario';

/** URL que o usuário tentou abrir, para devolver ele lá depois do login. */
function urlDestino(router: Router): string {
  const navegacao = router.currentNavigation();
  return navegacao ? router.serializeUrl(navegacao.extractedUrl) : router.url;
}

/**
 * Gate: só entra logado. É `canMatch`: quem não passa nem baixa o JS da rota.
 * Quem não está logado vai para o login (mock: tela /login; bff: direto para a Microsoft).
 * Com a flag `autenticacao` desligada, sempre passa.
 */
export const exigeLogin: CanMatchFn = () => {
  const auth = inject(Auth);
  if (!auth.ativa || auth.autenticado()) return true;
  return auth.irParaLogin(urlDestino(inject(Router)));
};

/** Gate: só entra quem tem um dos papéis. Respeita as flags `autenticacao` e `controleDePapeis`. */
export function exigePapel(...papeis: Papel[]): CanMatchFn {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (auth.ativa && !auth.autenticado()) return auth.irParaLogin(urlDestino(router));
    return auth.podeAcessar(...papeis) || router.createUrlTree(['/sem-permissao']);
  };
}

/** Gate das telas públicas de sessão: só para quem NÃO está logado (e só com autenticação ligada). */
export const apenasVisitante: CanMatchFn = () => {
  const auth = inject(Auth);
  if (auth.ativa && !auth.autenticado()) return true;
  return inject(Router).createUrlTree(['/inicio']);
};

/**
 * Gate da tela /login: ela só existe no login simulado (mock).
 * No bff, quem abrir /login (favorito antigo) vai para /inicio, e de lá o exigeLogin leva à Microsoft.
 */
export const apenasLoginSimulado: CanMatchFn = () =>
  inject(Auth).temTelaDeLogin || inject(Router).createUrlTree(['/inicio']);
